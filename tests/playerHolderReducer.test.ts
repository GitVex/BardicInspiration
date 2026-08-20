import { describe, expect, it } from 'vitest';
import { PlayerHolderState, playerHolderReducer } from '../components/Contexts/states';
import IFPlayer from '../components/Player/types/IFPlayer';

const fakePlayer = (name: string) => ({ name } as unknown as IFPlayer);

const initial = (count: number): PlayerHolderState => ({
    holders: Array(count)
        .fill(null)
        .map((_, id) => ({ id, player: null, isReady: false })),
    firstLoadDone: false,
});

describe('playerHolderReducer', () => {
    it('sets a player without clearing readiness', () => {
        // The ordering that matters: onReady can fire before the constructor returns, so a
        // setPlayer landing afterwards must not overwrite the isReady the holder already has.
        let state = initial(2);
        state = playerHolderReducer(state, { type: 'setReady', index: 0 });
        state = playerHolderReducer(state, { type: 'setPlayer', index: 0, payload: fakePlayer('a') });

        expect(state.holders[0].isReady).toBe(true);
        expect(state.holders[0].player).toEqual(fakePlayer('a'));
    });

    it('sets readiness without clearing the player', () => {
        let state = initial(2);
        state = playerHolderReducer(state, { type: 'setPlayer', index: 1, payload: fakePlayer('b') });
        state = playerHolderReducer(state, { type: 'setReady', index: 1 });

        expect(state.holders[1].player).toEqual(fakePlayer('b'));
        expect(state.holders[1].isReady).toBe(true);
    });

    it('preserves the holder id', () => {
        const state = playerHolderReducer(initial(3), { type: 'setReady', index: 2 });
        expect(state.holders[2].id).toBe(2);
    });

    it('leaves sibling holders referentially identical', () => {
        const state = initial(3);
        const next = playerHolderReducer(state, { type: 'setReady', index: 0 });

        expect(next.holders[1]).toBe(state.holders[1]);
        expect(next.holders[2]).toBe(state.holders[2]);
    });

    it('ignores an out-of-range index', () => {
        const state = initial(2);
        expect(playerHolderReducer(state, { type: 'setReady', index: 9 }).holders).toEqual(state.holders);
    });

    it('records firstLoadDone', () => {
        expect(playerHolderReducer(initial(1), { type: 'setFirstLoadDone' }).firstLoadDone).toBe(true);
    });
});
