import { describe, expect, it } from 'vitest';
import { selectTrackType } from '../components/Filter/filterTypes';

describe('track type filtering', () => {
    it('switches mutually exclusive types while retaining descriptive tags', () => {
        expect(selectTrackType(['music', 'forest', 'night'], 'ambience')).toEqual(['ambience', 'forest', 'night']);
    });
    it('selects All without clearing descriptive tags', () => {
        expect(selectTrackType(['standalone', 'forest'], '')).toEqual(['forest']);
    });
    it('does not duplicate the selected type', () => {
        expect(selectTrackType(['music', 'forest'], 'music')).toEqual(['music', 'forest']);
    });
});
