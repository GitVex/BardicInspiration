import { useEffect, useState } from 'react';
import { IVideoData } from '../types/IVideoData';
import { normalizeCreatorUrl } from './utils';

export const useVideoInfo = () => {
    const [url, setUrlState] = useState('');
    const [retryCount, setRetryCount] = useState(0);
    const [result, setResult] = useState<{ url: string; video: IVideoData; present: boolean } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const normalizedUrl = normalizeCreatorUrl(url);
    const setUrl = (value: string) => {
        setUrlState(value);
        setResult(null);
        setError(null);
    };

    useEffect(() => {
        if (!normalizedUrl) return;
        const controller = new AbortController();
        const timer = setTimeout(async () => {
            try {
                const [metadata, presence] = await Promise.all([
                    fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(normalizedUrl)}&format=json`, {
                        signal: controller.signal,
                    }),
                    fetch('/api/creator/presenceCheck', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ url: normalizedUrl }),
                        signal: controller.signal,
                    }),
                ]);
                if (!metadata.ok) throw new Error('Could not load this video. Check that it is public and available.');
                if (!presence.ok) throw new Error('Could not check your library. Please try again.');
                const video = await metadata.json();
                const existing = await presence.json();
                if (!video.title || !video.author_name || typeof existing.status !== 'boolean')
                    throw new Error('Could not verify this video. Please try again.');
                if (!controller.signal.aborted) setResult({ url, video, present: existing.status });
            } catch (cause) {
                if (!controller.signal.aborted)
                    setError(cause instanceof Error ? cause.message : 'Could not check this video. Please try again.');
            }
        }, 400);
        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [url, normalizedUrl, retryCount]);

    const current = result?.url === url ? result : null;
    return {
        url,
        setUrl,
        normalizedUrl,
        focussedVideo: current?.video ?? null,
        isPresent: current?.present ?? false,
        isChecking: !!normalizedUrl && !current && !error,
        lookupError: error,
        retry: () => {
            setError(null);
            setRetryCount(count => count + 1);
        },
    };
};
