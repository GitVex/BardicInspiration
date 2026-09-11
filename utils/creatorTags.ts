import { isTrackType } from '../components/Filter/filterTypes';
import { ApiError } from './api/handler';

export function validateCreatorTags(input: string): string[] {
    const tags = [
        ...new Set(
            input
                .split(',')
                .map(tag => tag.trim())
                .filter(Boolean)
                .map(tag => (isTrackType(tag.toLowerCase()) ? tag.toLowerCase() : tag))
        ),
    ];
    if (tags.filter(isTrackType).length !== 1) {
        throw new ApiError(400, 'Choose exactly one track type: music, ambience, or standalone.');
    }
    return tags;
}
