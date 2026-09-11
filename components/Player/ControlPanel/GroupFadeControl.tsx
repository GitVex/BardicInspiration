import { usePlayerHolder } from '../../Contexts/PlayerHolderProvider';
import IFPlayer from '../types/IFPlayer';
import { FadeOptions, fadeIn, fadeOut, fadeToVolume } from '../fadeFunctions';
import { useStackControls } from '../../Contexts/StackControlsProvider';
import { PresetState } from '../Contexts/states';
import ControlPanelButton from './utils/ControlPanelButton';
import React from 'react';

type StackControls = ReturnType<typeof useStackControls>;

/** How long a nudge takes. Short enough to read as a trim rather than as a cue. */
export const NUDGE_FADE_DURATION = 250;

/**
 * Runs a fade over every selected player, with that player's plumbing already assembled - where
 * to write its volume, which animation handle to cancel, where its pre-fade level is remembered.
 *
 * `players` is indexed by player id and holds a null for any slot whose iframe is not ready yet.
 * It must not be compacted first: dropping a null slides every later player onto the wrong index,
 * and the fade lands on someone else's card.
 */
function eachSelectedPlayer(
    players: (IFPlayer | null)[],
    controls: StackControls,
    run: (options: FadeOptions, currentVolume: number, player: PresetState['players'][number]) => void,
) {
    const {
        presetState,
        presetDispatch,
        localVolumes,
        localVolumesDispatch,
        fadeAnimations,
        fadeAnimationsDispatch,
    } = controls;

    presetState.players.forEach((player, idx) => {
        const framePlayer = players[idx];
        if (!player.selected || !framePlayer) return;

        const currentVolume = localVolumes.volume[idx];

        run({
            framePlayer,
            localVolumeControl: {
                localVolume: currentVolume,
                setLocalVolume: (vol: number) =>
                    localVolumesDispatch({ type: 'setVolume', index: idx, payload: vol }),
            },
            fadeAnimationControl: {
                fadeAnimationHandle: fadeAnimations.fadeAnimationHandles[idx],
                setFadeAnimationHandle: (handle: number | null) =>
                    fadeAnimationsDispatch({ type: 'setFadeAnimationHandle', index: idx, payload: handle }),
            },
            savedVolumeControl: {
                savedVolume: player.savedVolume,
                setSavedVolume: (savedVolume: { hasSaved: boolean; prevVol: number }) =>
                    presetDispatch({ type: 'setSavedVolume', index: idx, payload: savedVolume }),
            },
        }, currentVolume, player);
    });
}

export function createGroupFadeHandler(
    direction: 'in' | 'out',
    players: (IFPlayer | null)[],
    controls: StackControls,
) {
    return () => {
        const fadeAction = direction === 'in' ? fadeIn : fadeOut;

        eachSelectedPlayer(players, controls, (options, currentVolume, player) => {
            const targetVolume = direction === 'in'
                ? (player.savedVolume ? player.savedVolume.prevVol : currentVolume)
                : 0;

            fadeAction({ ...options, pLimit: targetVolume, sync: true });
        });
    };
}

/**
 * Sends the whole selection to one absolute volume, locked to the synced duration so they land
 * together - the same contract the fade in and out buttons already have.
 */
export function createGroupFadeToHandler(players: (IFPlayer | null)[], controls: StackControls) {
    return (target: number) => {
        eachSelectedPlayer(players, controls, options =>
            fadeToVolume({ ...options, pLimit: target, sync: true }));
    };
}

/**
 * Trims the selection by a fixed step.
 *
 * Relative to each player's own level rather than to a shared one, so nudging a mix moves it as a
 * whole and keeps the balance the user has already dialled in.
 */
export function createGroupNudgeHandler(players: (IFPlayer | null)[], controls: StackControls) {
    return (delta: number) => {
        eachSelectedPlayer(players, controls, (options, currentVolume) =>
            fadeToVolume({ ...options, pLimit: currentVolume + delta, durationMs: NUDGE_FADE_DURATION }));
    };
}

function GroupFadeControl({ initialLoadDone }: { initialLoadDone: boolean }) {
    const { holders } = usePlayerHolder();

    // Memoised on holders, because .map() built a new array every render, which changed the
    // identity the handlers below key off and made memoising them pointless. The nulls are kept
    // so the array stays indexed by player id - see eachSelectedPlayer.
    const players = React.useMemo(() => holders.map(holder => holder.player), [holders]);

    const controls = useStackControls();

    const handleGroupFadeIn = React.useMemo(
        () => createGroupFadeHandler('in', players, controls),
        [players, controls],
    );

    const handleGroupFadeOut = React.useMemo(
        () => createGroupFadeHandler('out', players, controls),
        [players, controls],
    );

    // Naming the count is the point of the redesign: the buttons act on the selection above them,
    // and there was previously nothing tying the two together.
    const selectedCount = controls.presetState.players.filter(player => player.selected).length;
    const disable = !initialLoadDone || selectedCount === 0;

    return (
        <div className="flex w-full flex-row gap-2">
            <ControlPanelButton onClick={handleGroupFadeIn} disabled={disable}>
                Fade In {selectedCount > 0 && `(${selectedCount})`}
            </ControlPanelButton>

            <ControlPanelButton onClick={handleGroupFadeOut} disabled={disable}>
                Fade Out {selectedCount > 0 && `(${selectedCount})`}
            </ControlPanelButton>
        </div>
    );
}

export default GroupFadeControl;
