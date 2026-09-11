import { beforeEach, describe, expect, it, vi } from 'vitest';
import { describeEvent, HOTKEY_BINDINGS } from '../components/Player/hooks/hotkeyBindings';
import { fadeToVolume } from '../components/Player/fadeFunctions';
import IFPlayer from '../components/Player/types/IFPlayer';

/**
 * Builds the parts of a KeyboardEvent describeEvent actually reads. Passing a literal keeps the
 * Num Lock and Shift combinations below readable - a real event cannot be constructed in the node
 * environment the suite runs in.
 */
function keyEvent(code: string, key: string, shiftKey = false): KeyboardEvent {
    return { code, key, shiftKey } as KeyboardEvent;
}

describe('describeEvent', () => {
    it('reads the number row off the key code', () => {
        expect(describeEvent(keyEvent('Digit3', '3'))).toBe('digit3');
        expect(describeEvent(keyEvent('Digit8', '8', true))).toBe('shift+digit8');
    });

    it('folds the numpad onto the same descriptor as the number row', () => {
        expect(describeEvent(keyEvent('Numpad3', '3'))).toBe('digit3');
        expect(describeEvent(keyEvent('Numpad8', '8', true))).toBe('shift+digit8');
    });

    // With Num Lock off, or with Shift held, the numpad reports its navigation meaning through
    // `key` while the code stays put. Matching on the code is what keeps these working.
    it('reads the numpad the same way when it reports navigation keys', () => {
        expect(describeEvent(keyEvent('Numpad1', 'End'))).toBe('digit1');
        expect(describeEvent(keyEvent('Numpad2', 'ArrowDown'))).toBe('digit2');
        expect(describeEvent(keyEvent('Numpad3', 'PageDown', true))).toBe('shift+digit3');
    });

    it('leaves digits outside 1 - 8 unbound', () => {
        expect(describeEvent(keyEvent('Digit9', '9'))).toBe('9');
        expect(describeEvent(keyEvent('Numpad0', '0'))).toBe('0');

        const descriptors = HOTKEY_BINDINGS.flatMap(binding => binding.keys);
        expect(descriptors).not.toContain('9');
        expect(descriptors).not.toContain('0');
    });

    it('gives the numpad and the main row one descriptor for the nudge keys', () => {
        expect(describeEvent(keyEvent('NumpadAdd', '+'))).toBe('+');
        expect(describeEvent(keyEvent('Equal', '+', true))).toBe('+');
        expect(describeEvent(keyEvent('NumpadSubtract', '-'))).toBe('-');
        expect(describeEvent(keyEvent('Minus', '-'))).toBe('-');
    });

    it('takes letters, punctuation and space from the key', () => {
        expect(describeEvent(keyEvent('KeyT', 'T', true))).toBe('t');
        expect(describeEvent(keyEvent('Comma', ','))).toBe(',');
        expect(describeEvent(keyEvent('Space', ' '))).toBe('space');
    });

    it('keeps shift on the arrows, which the master volume needs to tell apart', () => {
        expect(describeEvent(keyEvent('ArrowUp', 'ArrowUp'))).toBe('arrowup');
        expect(describeEvent(keyEvent('ArrowUp', 'ArrowUp', true))).toBe('shift+arrowup');
    });
});

describe('HOTKEY_BINDINGS', () => {
    it('binds each descriptor once, so dispatch order never decides the winner', () => {
        const descriptors = HOTKEY_BINDINGS.flatMap(binding => binding.keys);
        expect(new Set(descriptors).size).toBe(descriptors.length);
    });

    it('gives every binding a unique id', () => {
        const ids = HOTKEY_BINDINGS.map(binding => binding.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    // A binding with no display text is folded into the row above it in the help overlay, so it
    // must not carry a label of its own either.
    it('leaves continuation rows fully blank', () => {
        HOTKEY_BINDINGS.filter(binding => !binding.display).forEach(binding => {
            expect(binding.label, binding.id).toBe('');
        });
    });
});

/** A player that records what was asked of it and reports whichever state the test needs. */
function fakePlayer(state: number) {
    return {
        getPlayerState: () => state,
        playVideo: vi.fn(),
        pauseVideo: vi.fn(),
    } as unknown as IFPlayer & { playVideo: ReturnType<typeof vi.fn>; pauseVideo: ReturnType<typeof vi.fn> };
}

const PLAYING = 1;
const PAUSED = 2;

describe('fadeToVolume', () => {
    let steps: FrameRequestCallback[];

    beforeEach(() => {
        steps = [];
        // Collected rather than run inline: the fades cancel their own handle on the last frame,
        // and that handle is only assigned once requestAnimationFrame has returned.
        globalThis.requestAnimationFrame = (callback: FrameRequestCallback) => steps.push(callback);
        globalThis.cancelAnimationFrame = () => undefined;
    });

    /** Sends a player to a target and runs the fade straight to its final frame. */
    function fadeTo(player: IFPlayer, from: number, target: number) {
        const setLocalVolume = vi.fn();

        fadeToVolume({
            framePlayer: player,
            localVolumeControl: { localVolume: from, setLocalVolume },
            fadeAnimationControl: { fadeAnimationHandle: null, setFadeAnimationHandle: () => undefined },
            pLimit: target,
        });

        steps.forEach(step => step(performance.now() + 60_000));

        return setLocalVolume.mock.calls.at(-1)?.[0];
    }

    it('starts a paused player rather than ramping one that is not playing', () => {
        const player = fakePlayer(PAUSED);

        expect(fadeTo(player, 0, 40)).toBe(40);
        expect(player.playVideo).toHaveBeenCalled();
    });

    it('ramps a playing player to the target without restarting it', () => {
        const player = fakePlayer(PLAYING);

        expect(fadeTo(player, 70, 30)).toBe(30);
        expect(player.playVideo).not.toHaveBeenCalled();
        expect(player.pauseVideo).not.toHaveBeenCalled();
    });

    it('pauses a playing player once a target of zero arrives', () => {
        const player = fakePlayer(PLAYING);

        expect(fadeTo(player, 60, 0)).toBe(0);
        expect(player.pauseVideo).toHaveBeenCalled();
    });

    it('leaves a paused player alone when asked for silence', () => {
        const player = fakePlayer(PAUSED);

        expect(fadeTo(player, 0, 0)).toBeUndefined();
        expect(player.playVideo).not.toHaveBeenCalled();
        expect(player.pauseVideo).not.toHaveBeenCalled();
    });

    // The nudge keys hand over current + 10 without checking the ends, so the clamp lives here
    it('clamps a target to the volume range', () => {
        expect(fadeTo(fakePlayer(PLAYING), 95, 105)).toBe(100);
        expect(fadeTo(fakePlayer(PLAYING), 5, -10)).toBe(0);
    });
});
