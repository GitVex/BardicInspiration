import { describe, expect, it } from 'vitest';
import { deletionLimit, unavailabilityReason } from '../utils/api/videoAvailability';

describe('unavailabilityReason', () => {
    it('flags an id the api returned nothing for', () => {
        // Deleted and private videos simply vanish from the response - the main case for pruning
        expect(unavailabilityReason(undefined)).toMatch(/not found/);
    });

    it('keeps a plain, playable video', () => {
        expect(unavailabilityReason({ id: 'abc', status: { privacyStatus: 'public' } })).toBeNull();
    });

    it('flags deleted, rejected and private uploads', () => {
        expect(unavailabilityReason({ id: 'a', status: { uploadStatus: 'deleted' } })).not.toBeNull();
        expect(unavailabilityReason({ id: 'a', status: { uploadStatus: 'rejected' } })).not.toBeNull();
        expect(unavailabilityReason({ id: 'a', status: { privacyStatus: 'private' } })).not.toBeNull();
    });

    it('keeps a video blocked in only a couple of regions', () => {
        const video = {
            id: 'a',
            contentDetails: { regionRestriction: { blocked: ['DE', 'AT'] } },
        };
        expect(unavailabilityReason(video)).toBeNull();
    });

    it('flags a video blocked in three or more regions', () => {
        const video = {
            id: 'a',
            contentDetails: { regionRestriction: { blocked: ['DE', 'AT', 'CH'] } },
        };
        expect(unavailabilityReason(video)).toMatch(/blocked in 3/);
    });

    it('keeps a video with a non-empty allow list', () => {
        const video = { id: 'a', contentDetails: { regionRestriction: { allowed: ['DE'] } } };
        expect(unavailabilityReason(video)).toBeNull();
    });

    it('flags a video allowed nowhere', () => {
        const video = { id: 'a', contentDetails: { regionRestriction: { allowed: [] } } };
        expect(unavailabilityReason(video)).toMatch(/no regions/);
    });
});

describe('deletionLimit', () => {
    it('caps a run at a tenth of the table', () => {
        expect(deletionLimit(500)).toBe(50);
    });

    it('always allows at least one row, so a small library is still prunable', () => {
        expect(deletionLimit(4)).toBe(1);
        expect(deletionLimit(0)).toBe(1);
    });
});
