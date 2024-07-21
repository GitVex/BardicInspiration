import React, { useState, useEffect } from 'react';
import { IVideoData } from '../types/IVideoData';
import { validateUrl } from './utils';
import { mutate } from 'swr'

const useFormSubmit = (url: string, tags: string, focussedVideo: IVideoData | null, isPresent: boolean) => {
    const [isSubmittable, setIsSubmittable] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!url || !validateUrl(url)) {
            return;
        }

        try {
            await fetch('/api/creator/create', {
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

            // Assuming you have a way to check presence status after submit
            await mutate('/api/viewer/new')
        } catch (error) {
            console.error('Failed to submit:', error);
        }
    };
    useEffect(() => {
        setIsSubmittable(!!(url && tags && !isPresent));
    }, [url, tags, isPresent]);

    return {
        isSubmittable,
        handleSubmit,
    };
};

export default useFormSubmit;