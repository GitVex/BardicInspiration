import { describe, expect, it } from 'vitest';
import { validateCreatorTags } from '../utils/creatorTags';
import { normalizeCreatorUrl } from '../components/Creator/hooks/utils';

describe('creator track types', () => {
    it('requires a type even when descriptive tags are provided', () => {
        expect(() => validateCreatorTags('forest,night')).toThrow('Choose exactly one track type');
    });
    it('rejects mutually exclusive types', () => {
        expect(() => validateCreatorTags('music,ambience,forest')).toThrow('Choose exactly one track type');
    });
    it('normalizes type casing and removes duplicate tags', () => {
        expect(validateCreatorTags(' Music,forest,music,forest, ')).toEqual(['music', 'forest']);
    });
    it('allows a type without descriptive tags', () => {
        expect(validateCreatorTags('standalone')).toEqual(['standalone']);
    });
});

describe('creator video links', () => {
    it('accepts shortened links and strips playback parameters', () => {
        expect(normalizeCreatorUrl('youtu.be/dQw4w9WgXcQ?t=30')).toBe('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    });
    it('rejects invalid and non-YouTube links rather than reusing a previous URL', () => {
        for (const value of [
            '',
            'not a link',
            'https://youtube.com/watch',
            'https://evil.example/youtube.com/watch?v=dQw4w9WgXcQ',
        ]) {
            expect(normalizeCreatorUrl(value)).toBeNull();
        }
    });
});
