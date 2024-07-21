import { useState } from 'react';
import { IVideoData } from '../types/IVideoData';
import { validateUrl } from './utils';

const fetchVideoInfo = async (url: string) => {
    try {
        const oembedUrl = `https://www.youtube.com/oembed?url=${url}&format=json`;
        const response = await fetch(oembedUrl);
        const data = await response.json();
        data.html = data.html.replace(/width="\d+"/, 'width="100%"').replace(/height="\d+"/, 'height="113"');
        return data;
    } catch (error) {
        console.error('Failed to fetch video info:', error);
        return null;
    }
};

const checkPresence = async (url: string) => {
    try {
        const res = await fetch('/api/creator/presenceCheck', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url }),
        });
        const presence = await res.json();
        return presence.status;
    } catch (error) {
        console.error('Failed to check presence:', error);
        return false;
    }
};

export const useVideoInfo = () => {
    const [url, setUrl] = useState('');
    const [focussedVideo, setFocussedVideo] = useState<IVideoData | null>(null);
    const [isPresent, setIsPresent] = useState(false);

    const fetchAndSetVideoInfo = async (url: string) => {
        if (validateUrl(url)) {
            setUrl(url);
            const videoData = await fetchVideoInfo(url);
            setFocussedVideo(videoData);
            const presenceStatus = await checkPresence(url);
            setIsPresent(presenceStatus);
        }
    };

    return {
        url,
        focussedVideo,
        isPresent,
        fetchAndSetVideoInfo,
    };
};
