import { usePlayerHolder } from '../../Contexts/PlayerHolderProvider';
import IFPlayer from '../types/IFPlayer';
import { fadeIn, fadeOut } from '../fadeFunctions';
import { useStackControls } from '../../Contexts/StackControlsProvider';
import ControlPanelButton from './utils/ControlPanelButton';
import React from 'react';

function createGroupFadeHandler(
    direction: 'in' | 'out',
    framedPlayers: IFPlayer[],
    controls: ReturnType<typeof useStackControls>
) {
    const {
        presetState,
        presetDispatch,
        localVolumes,
        localVolumesDispatch,
        fadeAnimations,
        fadeAnimationsDispatch,
    } = controls;

    return () => {
        // Determine the fade action based on the direction
        const fadeAction = direction === 'in' ? fadeIn : fadeOut;

        presetState.players.forEach((player, idx) => {
            const framePlayer = framedPlayers[idx];
            if (!player.selected || !framePlayer) return;

            let targetVolume
            if (direction == 'in') {
                if (player.savedVolume) {
                    targetVolume = player.savedVolume.prevVol
                } else {
                    targetVolume = localVolumes.volume[idx]
                }
            } else {
                targetVolume = 0
            }

            // Functions to update state
            const setVolume = (vol: number) => {
                localVolumesDispatch({ type: 'setVolume', index: idx, payload: vol });
            };

            const fadeAnimationHandle = fadeAnimations.fadeAnimationHandles[idx];
            const setFadeAnimationHandle = (interval: number | null) => {
                fadeAnimationsDispatch({
                    type: 'setFadeAnimationHandle',
                    index: idx,
                    payload: interval,
                });
            };

            const setSavedVolume = (savedVolume: { hasSaved: boolean; prevVol: number }) => {
                presetDispatch({
                    type: 'setSavedVolume',
                    index: idx,
                    payload: savedVolume,
                });
            };

            fadeAction({
                framePlayer,
                localVolumeControl: {
                    localVolume: localVolumes.volume[idx],
                    setLocalVolume: setVolume,
                },
                fadeAnimationControl: {
                    fadeAnimationHandle,
                    setFadeAnimationHandle,
                },
                savedVolumeControl: {
                    savedVolume: player.savedVolume,
                    setSavedVolume,
                },
                pLimit: targetVolume,
                inverse: direction === 'out',
                sync: true
            });
        });
    };
}

function GroupFadeControl({ initialLoadDone }: { initialLoadDone: boolean }) {
    const { holders } = usePlayerHolder();

    // Filter out null framedPlayers early. Memoised on holders, because .map().filter() built a
    // new array every render, which changed the identity the handlers below key off and made
    // memoising them pointless.
    const framedPlayers = React.useMemo(
        () => holders
            .map(holder => holder.player)
            .filter((player): player is IFPlayer => player !== null),
        [holders],
    );

    const controls = useStackControls();

    const handleGroupFadeIn = React.useMemo(
        () => createGroupFadeHandler('in', framedPlayers, controls),
        [framedPlayers, controls],
    );

    const handleGroupFadeOut = React.useMemo(
        () => createGroupFadeHandler('out', framedPlayers, controls),
        [framedPlayers, controls],
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
