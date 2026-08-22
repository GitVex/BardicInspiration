/*
 * One-time backfill: rewrites every track's url to its canonical form (see normalizeYoutubeUrl),
 * stripping tracking/playback params like `si`, `t`, `list` and collapsing youtu.be/embed/shorts
 * shapes down to a single watch?v= url.
 *
 * Normalizing can make two rows collide on the same video - the same track saved twice under a
 * different raw url. `url` is unique, so the newer of each colliding pair is deleted and logged,
 * the same audit pattern the nightly prune job uses, rather than left to fail the update.
 *
 * Kept apart from the route so it can be unit tested and invoked without an HTTP round trip.
 */
import { prisma } from '../prismaClientProvider';
import { ApiError } from './handler';
import { normalizeYoutubeUrl } from '../youtubeUrl';

interface TrackRow {
    track_id: number;
    url: string;
    title: string;
}

export interface NormalizeSummary {
    checked: number;
    skippedUnparsableUrls: string[];
    updated: Array<{ track_id: number; from: string; to: string }>;
    removedDuplicates: Array<{ track_id: number; url: string; keptTrackId: number }>;
    dryRun: boolean;
}

export async function normalizeTrackUrls(dryRun: boolean): Promise<NormalizeSummary> {
    const allTracks: TrackRow[] = await prisma.track.findMany({
        select: { track_id: true, url: true, title: true },
    });

    // A url we cannot parse is left alone and reported - a parsing gap must never turn into a
    // destructive write.
    const unparsable: TrackRow[] = [];
    const resolved: Array<TrackRow & { normalized: string }> = [];

    for (const track of allTracks) {
        try {
            resolved.push({ ...track, normalized: normalizeYoutubeUrl(track.url) });
        } catch {
            unparsable.push(track);
        }
    }

    // Group by normalized url so duplicates collapsing onto the same canonical form are caught
    // before they hit the unique constraint. The lowest track_id in each group is kept.
    const byNormalized = new Map<string, Array<TrackRow & { normalized: string }>>();
    for (const track of resolved) {
        const group = byNormalized.get(track.normalized);
        if (group) {
            group.push(track);
        } else {
            byNormalized.set(track.normalized, [track]);
        }
    }

    const updated: NormalizeSummary['updated'] = [];
    const removedDuplicates: NormalizeSummary['removedDuplicates'] = [];

    for (const group of byNormalized.values()) {
        const [kept, ...duplicates] = group.sort((a, b) => a.track_id - b.track_id);

        if (kept.url !== kept.normalized) {
            updated.push({ track_id: kept.track_id, from: kept.url, to: kept.normalized });
        }

        for (const duplicate of duplicates) {
            removedDuplicates.push({
                track_id: duplicate.track_id,
                url: duplicate.url,
                keptTrackId: kept.track_id,
            });
        }
    }

    const summary = {
        checked: resolved.length,
        skippedUnparsableUrls: unparsable.map((track) => track.url),
        updated,
        removedDuplicates,
    };

    if (dryRun || (updated.length === 0 && removedDuplicates.length === 0)) {
        return { ...summary, dryRun };
    }

    const history = removedDuplicates.map(
        (entry) => `${entry.track_id} | ${entry.url} | duplicate of ${entry.keptTrackId}`,
    );

    // Duplicates are deleted before the surviving row's url is rewritten: if a kept row's
    // normalized url currently belongs to the duplicate being removed, updating first would
    // collide with it under the still-live unique constraint.
    const operations = [
        ...(removedDuplicates.length > 0
            ? [
                  prisma.track.deleteMany({
                      where: { track_id: { in: removedDuplicates.map((entry) => entry.track_id) } },
                  }),
                  prisma.log.create({
                      data: {
                          time: new Date(),
                          type: 'normalizeTrackUrls',
                          message: `Removed ${removedDuplicates.length} duplicate(s) created by url normalization`,
                          history,
                      },
                  }),
              ]
            : []),
        ...updated.map((entry) =>
            prisma.track.update({ where: { track_id: entry.track_id }, data: { url: entry.to } }),
        ),
    ];

    try {
        await prisma.$transaction(operations);
    } catch (e) {
        throw new ApiError(500, `Failed to write normalized urls: ${e}`);
    }

    return { ...summary, dryRun: false };
}
