import { useState } from 'react';

export const useTags = () => {
    const [tags, setTags] = useState('');

    const setTagsFromInput = (input: string) => {
        setTags(input || '');
    };

    return {
        tags,
        setTagsFromInput,
    };
};
