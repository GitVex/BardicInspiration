import { describe, expect, it } from 'vitest';
import { argMin, transformToTarget } from '../components/utils/utils';
import { buildQuery, separateTags } from '../utils/separateTags';

describe('argMin', () => {
    it('finds the index of the smallest value', () => {
        expect(argMin([5, 2, 9])).toBe(1);
    });

    it('returns the first index on a tie', () => {
        // The longest-paused player: ties must resolve deterministically, not arbitrarily
        expect(argMin([3, 3, 3])).toBe(0);
    });

    it('throws on an empty array rather than returning -1', () => {
        expect(() => argMin([])).toThrow();
    });
});

describe('transformToTarget', () => {
    it('passes an 11 character id straight through', () => {
        expect(transformToTarget('NpEaa2P7qZI')).toBe('NpEaa2P7qZI');
    });

    it('extracts the id from the common youtube url shapes', () => {
        const urls = [
            'https://www.youtube.com/watch?v=NpEaa2P7qZI',
            'https://youtu.be/NpEaa2P7qZI',
            'https://www.youtube.com/embed/NpEaa2P7qZI',
            'https://www.youtube.com/shorts/NpEaa2P7qZI',
            'https://www.youtube.com/watch?list=PLxyz&v=NpEaa2P7qZI',
        ];

        for (const url of urls) {
            expect(transformToTarget(url), url).toBe('NpEaa2P7qZI');
        }
    });

    it('returns null for empty input', () => {
        expect(transformToTarget('')).toBeNull();
    });

    it('throws on something that is neither an id nor a youtube url', () => {
        expect(() => transformToTarget('https://example.com/video')).toThrow();
    });
});

describe('separateTags', () => {
    it('trims each tag', () => {
        expect(separateTags('tavern, battle ,  calm')).toEqual(['tavern', 'battle', 'calm']);
    });

    it('drops empty segments when building the query', () => {
        expect(buildQuery('tavern,,battle,')).toEqual([
            { where: { name: 'tavern' }, create: { name: 'tavern' } },
            { where: { name: 'battle' }, create: { name: 'battle' } },
        ]);
    });

    it('produces an empty query for an empty tag string', () => {
        expect(buildQuery('')).toEqual([]);
    });
});
