import React, { useState, useEffect } from 'react';
import { IVideoData } from '../types/IVideoData';
import { validateUrl } from './utils';
import { useInvalidateNewItems } from '../../Viewer/hooks/useNewItems';

const useFormSubmit = (url: string, tags: string, focussedVideo: IVideoData | null, isPresent: boolean) => {
    const [isSubmittable, setIsSubmittable] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    // Not useNewItems(): reaching the helper through it mounted a second paginated subscription,
    // at the default page size rather than the 30 the list renders with
    const invalidateNewItems = useInvalidateNewItems();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!url || !validateUrl(url)) {
            return;
        }

        setIsLoading(true);
        setSubmitError(null);

        try {
            const res = await fetch('/api/creator/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...focussedVideo,
                    tags,
                    url,
                }),
            });

            // fetch only rejects on network failure, so a 500 from the route - a duplicate url,
            // a failed artist upsert - would otherwise read as success. Revalidating after one of
            // those returns the same rows it already had, which looks like the refetch is broken
            // when nothing was ever created.
            if (!res.ok) {
                const body = await res.text();
                throw new Error(`create failed: ${res.status} ${res.statusText} ${body}`);
            }

            await invalidateNewItems();
        } catch (error) {
            console.error('Failed to submit:', error);
            setSubmitError(error instanceof Error ? error.message : String(error));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        setIsSubmittable(!!(url && tags && !isPresent));
    }, [url, tags, isPresent]);

    return {
        isSubmittable,
        isLoading,
        submitError,
        handleSubmit,
    };
};

export default useFormSubmit;
