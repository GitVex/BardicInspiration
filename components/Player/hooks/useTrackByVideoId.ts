import useSWR from 'swr';
import { fetcher } from '../../Viewer/hooks/fetcher';

export interface TrackTint {
    track_id: number;
    title: string;
    color: string;
    luminance: number;
}

/**
 * The database row for the video a player currently holds, or null when the video was loaded by
 * id and is not in the library.
 *
 * Keyed on the video id, so the eight players asking about the same default video share a single
 * request rather than making eight.
 */
export function useTrackByVideoId(videoId: string | undefined) {
    const { data, error } = useSWR<{ track: TrackTint | null }, Error>(
        videoId ? `/api/viewer/trackByVideoId:${videoId}` : null,
        () => fetcher('/api/viewer/trackByVideoId', { videoId }),
        {
            revalidateOnFocus: false,
        },
    );

    return { track: data?.track ?? null, isError: error };
}
