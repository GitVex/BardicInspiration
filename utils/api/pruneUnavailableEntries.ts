/*
 * Nightly pruning job: removes tracks whose YouTube video is gone or unplayable.
 *
 * This job deletes rows, so every uncertain case is resolved in favour of keeping the track:
 * a url we cannot parse, an id YouTube refuses to answer for, or a run whose candidate list is
 * implausibly large all leave the table untouched.
 *
 * Kept apart from the route so the in-process cron schedule (see instrumentation.ts) can call it
 * directly instead of making an HTTP request to itself.
 */
import { prisma } from '../prismaClientProvider';
import { ApiError } from './handler';
import { getVideoIdFromYoutubeUrl } from '../youtubeUrl';
import { deletionLimit, unavailabilityReason, YoutubeVideo } from './videoAvailability';

/** The videos endpoint takes up to 50 ids per call - one call per 50 rows instead of per row. */
const YOUTUBE_BATCH_SIZE = 50;

interface TrackRow {
    track_id: number;
    url: string;
    title: string;
}

export interface PruneSummary {
    checked: number;
    skippedUnparsableUrls: string[];
    candidates: Array<{ track_id: number; title: string; url: string; reason: string }>;
    deleted: number;
    dryRun: boolean;
}

function chunk<T>(items: T[], size: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += size) {
        batches.push(items.slice(i, i + size));
    }
    return batches;
}

/**
 * Looks up every id in one batched pass. A failed request aborts the whole run: an empty result
 * is indistinguishable from "all of these videos are gone", and acting on it would clear the
 * table.
 */
async function fetchVideos(ids: string[], apiKey: string): Promise<Map<string, YoutubeVideo>> {
    const byId = new Map<string, YoutubeVideo>();

    for (const batch of chunk(ids, YOUTUBE_BATCH_SIZE)) {
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=status,contentDetails&id=${batch.join(
                ',',
            )}&key=${apiKey}`,
        );

        if (!response.ok) {
            throw new ApiError(
                502,
                `YouTube API responded ${response.status} - aborting without deleting anything`,
            );
        }

        const data = await response.json();

        if (!Array.isArray(data?.items)) {
            throw new ApiError(502, 'YouTube API returned no items array - aborting');
        }

        for (const item of data.items as YoutubeVideo[]) {
            byId.set(item.id, item);
        }
    }

    return byId;
}

export async function pruneUnavailableEntries(dryRun: boolean): Promise<PruneSummary> {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
        throw new ApiError(500, 'YOUTUBE_API_KEY is not set');
    }

    const allTracks: TrackRow[] = await prisma.track.findMany({
        select: { track_id: true, url: true, title: true },
    });

    // Urls that yield no id are left alone and reported - a parsing gap must never read as
    // "this video is gone".
    const unparsable: TrackRow[] = [];
    const resolved: Array<TrackRow & { videoId: string }> = [];

    for (const track of allTracks) {
        try {
            resolved.push({ ...track, videoId: getVideoIdFromYoutubeUrl(track.url) });
        } catch {
            unparsable.push(track);
        }
    }

    const videos = await fetchVideos(
        Array.from(new Set(resolved.map((track) => track.videoId))),
        apiKey,
    );

    const unavailable = resolved
        .map((track) => ({ track, reason: unavailabilityReason(videos.get(track.videoId)) }))
        .filter((entry): entry is { track: TrackRow & { videoId: string }; reason: string } =>
            entry.reason !== null,
        );

    const summary = {
        checked: resolved.length,
        skippedUnparsableUrls: unparsable.map((track) => track.url),
        candidates: unavailable.map(({ track, reason }) => ({
            track_id: track.track_id,
            title: track.title,
            url: track.url,
            reason,
        })),
    };

    const limit = deletionLimit(allTracks.length);
    if (unavailable.length > limit) {
        throw new ApiError(
            409,
            `${unavailable.length} of ${allTracks.length} tracks look unavailable, over the ${limit} row safety limit - deleted nothing`,
        );
    }

    if (dryRun || unavailable.length === 0) {
        return { ...summary, deleted: 0, dryRun };
    }

    // Delete and log together: a run that removes rows without leaving a record of what it took
    // is unrecoverable, since there is no soft delete to fall back on.
    const history = unavailable.map(
        ({ track, reason }) => `${track.track_id} | ${track.url} | ${track.title} | ${reason}`,
    );

    await prisma.$transaction([
        prisma.track.deleteMany({
            where: { track_id: { in: unavailable.map(({ track }) => track.track_id) } },
        }),
        prisma.log.create({
            data: {
                time: new Date(),
                type: 'cron',
                message: `Deleted ${unavailable.length} entry(s)`,
                history,
            },
        }),
    ]);

    return { ...summary, deleted: unavailable.length, dryRun: false };
}
