import { useEffect, useState } from 'react';
import IFPlayer from '../types/IFPlayer';

/**
 * The title to show for whatever a player is holding.
 *
 * A library track already carries its title, so the common case costs nothing. A video loaded by
 * id that was never submitted has to come from the player itself, and getVideoData is empty for a
 * moment after cueing - hence the short retry rather than a single read. Falls back to the raw id,
 * which is still more use than an empty row.
 */
export function useVideoTitle(
    framePlayer: IFPlayer | null,
    videoId: string | undefined,
    libraryTitle: string | undefined,
): string {
    const [playerTitle, setPlayerTitle] = useState<string | null>(null);

    useEffect(() => {
        setPlayerTitle(null);

        if (libraryTitle) return;
        if (!videoId) return;
        if (typeof framePlayer?.getVideoData !== 'function') return;

        let attempts = 0;
        const intervalId = setInterval(() => {
            const title = framePlayer.getVideoData()?.title;

            if (title) {
                setPlayerTitle(title);
                clearInterval(intervalId);
            } else if (++attempts >= 10) {
                clearInterval(intervalId);
            }
        }, 300);

        return () => clearInterval(intervalId);
    }, [framePlayer, videoId, libraryTitle]);

    return libraryTitle ?? playerTitle ?? videoId ?? '';
}
