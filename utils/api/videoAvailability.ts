/*
 * The rules the pruning job uses to decide a video is gone, kept apart from the route so they
 * can be tested without a database or a network.
 */

/**
 * A video blocked in a couple of countries is still playable for nearly everyone, so only a
 * broad block counts as unavailable. Preserves the `blocked.length > 2` threshold this job has
 * always used, now as something with a name.
 */
export const MIN_BLOCKED_REGIONS = 3;

export interface YoutubeVideo {
    id: string;
    status?: { uploadStatus?: string; privacyStatus?: string };
    contentDetails?: { regionRestriction?: { blocked?: string[]; allowed?: string[] } };
}

/** Returns why the video is unavailable, or null if it is fine. */
export function unavailabilityReason(video: YoutubeVideo | undefined): string | null {
    // Ids the API knows nothing about are deleted, private or never existed. This is the case
    // the job was written for and the one the old id parsing could never actually detect.
    if (!video) return 'not found (deleted or private)';

    const uploadStatus = video.status?.uploadStatus;
    if (uploadStatus === 'deleted' || uploadStatus === 'rejected') {
        return `upload status ${uploadStatus}`;
    }

    if (video.status?.privacyStatus === 'private') return 'private';

    const restriction = video.contentDetails?.regionRestriction;

    if (restriction?.blocked && restriction.blocked.length >= MIN_BLOCKED_REGIONS) {
        return `blocked in ${restriction.blocked.length} regions`;
    }

    // An `allowed` whitelist is the inverse form of the same restriction; an empty one means
    // playable nowhere.
    if (restriction?.allowed && restriction.allowed.length === 0) {
        return 'allowed in no regions';
    }

    return null;
}

/**
 * How many rows a single run is allowed to remove. If a run believes more than this share of
 * the library disappeared overnight, the likelier explanation is an API change or an exhausted
 * quota than a real mass takedown.
 */
export const MAX_DELETION_SHARE = 0.1;

export function deletionLimit(totalTracks: number): number {
    return Math.max(1, Math.floor(totalTracks * MAX_DELETION_SHARE));
}
