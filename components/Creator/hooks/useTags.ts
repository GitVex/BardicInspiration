import { useState } from 'react';
import { isTrackType } from '../../Filter/filterTypes';

export const useTags = () => {
    const [tags, setTags] = useState<string[]>([]);
    const addTag = (value: string) => {
        const tag = value.trim();
        if (!tag || tag.includes(',') || isTrackType(tag.toLowerCase())) return;
        setTags(previous =>
            previous.some(existing => existing.toLowerCase() === tag.toLowerCase()) ? previous : [...previous, tag]
        );
    };
    return {
        tags,
        addTag,
        removeTag: (tag: string) => setTags(previous => previous.filter(value => value !== tag)),
        clearTags: () => setTags([]),
    };
};
