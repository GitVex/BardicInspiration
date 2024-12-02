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
    const disable = !initialLoadDone;

    // Filter out null framedPlayers early
    const framedPlayers = holders
        .map(holder => holder.player)
        .filter((player): player is IFPlayer => player !== null);

    const controls = useStackControls();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const handleGroupFadeIn = React.useCallback(
        createGroupFadeHandler('in', framedPlayers, controls),
        [framedPlayers, controls]
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const handleGroupFadeOut = React.useCallback(
        createGroupFadeHandler('out', framedPlayers, controls),
        [framedPlayers, controls]
    );

    return (
        <div>
            <div className="flex flex-row gap-2 rounded border-2 border-darknavy-700 bg-darknavy-500 p-2">
                <ControlPanelButton onClick={handleGroupFadeIn} disabled={disable}>
                    Fade In
                </ControlPanelButton>

                <ControlPanelButton onClick={handleGroupFadeOut} disabled={disable}>
                    Fade Out
                </ControlPanelButton>
            </div>
        </div>
    );
}

export default GroupFadeControl;
