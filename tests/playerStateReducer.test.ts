import { describe, expect, it } from 'vitest';
import { PlayerStateAction, playerStateReducer } from '../components/Player/Contexts/states';
import { createInitialPresetState } from '../components/Player/Contexts/PresetProvider';

const initial = () => createInitialPresetState(4);

describe('playerStateReducer', () => {
    it('updates only the addressed player', () => {
        const state = initial();
        const next = playerStateReducer(state, { type: 'setVolume', index: 2, payload: 17 });

        expect(next.players[2].volume).toBe(17);
        expect(next.players.filter((_, i) => i !== 2)).toEqual(
            state.players.filter((_, i) => i !== 2),
        );
    });

    it('keeps untouched players referentially identical', () => {
        const state = initial();
        const next = playerStateReducer(state, { type: 'setVolume', index: 0, payload: 1 });

        // Memoised consumers rely on this: a volume change on player 0 must not invalidate player 1
        expect(next.players[1]).toBe(state.players[1]);
        expect(next.players[0]).not.toBe(state.players[0]);
    });

    it('does not mutate the state it is given', () => {
        const state = initial();
        playerStateReducer(state, { type: 'setId', index: 1, payload: 'abcdefghijk' });

        expect(state.players[1].videoId).not.toBe('abcdefghijk');
    });

    it('toggles selection', () => {
        let state = initial();
        state = playerStateReducer(state, { type: 'select', index: 3 });
        expect(state.players[3].selected).toBe(true);

        state = playerStateReducer(state, { type: 'deselect', index: 3 });
        expect(state.players[3].selected).toBe(false);
    });

    it('leaves state untouched for an out-of-range index', () => {
        const state = initial();

        for (const index of [-1, 4, 1.5, NaN]) {
            const next = playerStateReducer(state, { type: 'setVolume', index, payload: 99 });
            expect(next.players).toEqual(state.players);
        }
    });

    it('replaces the whole preset on setPreset', () => {
        const replacement = createInitialPresetState(4);
        replacement.title = 'Tavern';

        expect(playerStateReducer(initial(), { type: 'setPreset', payload: replacement }).title)
            .toBe('Tavern');
    });

    it('throws on an unknown action rather than silently returning state', () => {
        expect(() =>
            playerStateReducer(initial(), { type: 'nope' } as unknown as PlayerStateAction),
        ).toThrow();
    });

    it('sets master volume without touching players', () => {
        const state = initial();
        const next = playerStateReducer(state, { type: 'setMasterVolume', payload: 40 });

        expect(next.masterVolume).toBe(40);
        expect(next.players).toBe(state.players);
    });
});
