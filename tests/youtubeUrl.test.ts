import { describe, expect, it } from 'vitest';
import { getVideoIdFromYoutubeUrl, normalizeYoutubeUrl } from '../utils/youtubeUrl';

describe('getVideoIdFromYoutubeUrl', () => {
    it('extracts the id from a watch url', () => {
        expect(getVideoIdFromYoutubeUrl('https://www.youtube.com/watch?v=P7LOlEDzvTU')).toBe(
            'P7LOlEDzvTU',
        );
    });

    it('extracts the id from a youtu.be short link', () => {
        expect(getVideoIdFromYoutubeUrl('https://youtu.be/stnQ_L-lC48?si=fDzwNNQP3YDjw0dU')).toBe(
            'stnQ_L-lC48',
        );
    });

    it('extracts the id from an embed url', () => {
        expect(getVideoIdFromYoutubeUrl('https://www.youtube.com/embed/P7LOlEDzvTU')).toBe(
            'P7LOlEDzvTU',
        );
    });

    it('extracts the id from a shorts url', () => {
        expect(getVideoIdFromYoutubeUrl('https://www.youtube.com/shorts/P7LOlEDzvTU')).toBe(
            'P7LOlEDzvTU',
        );
    });

    it('throws on a url with no video id', () => {
        expect(() => getVideoIdFromYoutubeUrl('https://example.com/not-youtube')).toThrow(
            'Invalid youtube url',
        );
    });
});

describe('normalizeYoutubeUrl', () => {
    it('strips a timestamp param', () => {
        expect(normalizeYoutubeUrl('https://www.youtube.com/watch?v=P7LOlEDzvTU&t=42s')).toBe(
            'https://www.youtube.com/watch?v=P7LOlEDzvTU',
        );
    });

    it('strips a share id param from a youtu.be link', () => {
        expect(normalizeYoutubeUrl('https://youtu.be/stnQ_L-lC48?si=fDzwNNQP3YDjw0dU')).toBe(
            'https://www.youtube.com/watch?v=stnQ_L-lC48',
        );
    });

    it('strips channel and playlist params', () => {
        expect(
            normalizeYoutubeUrl(
                'https://www.youtube.com/watch?v=P7LOlEDzvTU&list=PL123&index=4&ab_channel=Someone',
            ),
        ).toBe('https://www.youtube.com/watch?v=P7LOlEDzvTU');
    });

    it('is idempotent on an already-canonical url', () => {
        const canonical = 'https://www.youtube.com/watch?v=P7LOlEDzvTU';
        expect(normalizeYoutubeUrl(canonical)).toBe(canonical);
    });

    it('collapses different shapes of the same video to the same canonical url', () => {
        const a = normalizeYoutubeUrl('https://www.youtube.com/watch?v=P7LOlEDzvTU');
        const b = normalizeYoutubeUrl('https://youtu.be/P7LOlEDzvTU?si=abc');
        expect(a).toBe(b);
    });

    it('throws on an unparsable url', () => {
        expect(() => normalizeYoutubeUrl('not a url')).toThrow('Invalid youtube url');
    });
});
