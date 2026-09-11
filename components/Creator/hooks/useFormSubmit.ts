import { useRef, useState } from 'react';
import { useSWRConfig } from 'swr';
import { useInvalidateNewItems } from '../../Viewer/hooks/useNewItems';
import { IVideoData } from '../types/IVideoData';

export default function useFormSubmit() {
    const [isLoading, setIsLoading] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const busy = useRef(false);
    const invalidateNewItems = useInvalidateNewItems();
    const { mutate } = useSWRConfig();

    const submit = async (url: string, tags: string[], video: IVideoData): Promise<boolean> => {
        if (busy.current) return false;
        busy.current = true;
        setIsLoading(true);
        setSubmitError(null);
        setSuccess(null);
        try {
            const response = await fetch('/api/creator/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...video, url, tags: tags.join(',') }),
            });
            if (!response.ok) {
                const body = await response.json().catch(() => null);
                throw new Error(body?.error || 'Could not add the track. Please try again.');
            }
            setSuccess(`Added ${video.title}.`);
            // Creation succeeded even if refreshing a list subsequently fails.
            void Promise.allSettled([
                invalidateNewItems(),
                mutate(key => Array.isArray(key) && key[0] === '/api/viewer/tags'),
            ]);
            return true;
        } catch (cause) {
            setSubmitError(cause instanceof Error ? cause.message : 'Could not add the track. Please try again.');
            return false;
        } finally {
            busy.current = false;
            setIsLoading(false);
        }
    };
    return {
        submit,
        isLoading,
        submitError,
        success,
        clearFeedback: () => {
            setSubmitError(null);
            setSuccess(null);
        },
    };
}
