// PlayerControlsProvider.tsx
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { usePlayerHolderById } from '../../Contexts/PlayerHolderProvider';
import { useStackActions, useStackState } from '../../Contexts/StackControlsProvider';
import IFPlayer from '../types/IFPlayer';
import { SavedVolume } from '../types/states';

interface PlayerControlsProviderType {
    playerId: number;
    framePlayer: IFPlayer | null;
    selected: boolean;
    setSelected: () => void;
    localVolume: number;
    setLocalVolume: (vol: number) => void;
    savedVolume: SavedVolume;
    setSavedVolume: (vol: SavedVolume) => void;
    fadeAnimationHandle: number | null;
    setFadeAnimationHandle: (animID: number | null) => void;
}

const PlayerControlsContext = createContext<PlayerControlsProviderType | null>(null);

interface PlayerControlsProviderProps {
    children: ReactNode;
    playerId: number;
}

/**
 * Narrows the stack-wide, index-addressed state down to one player, so nothing below this ever
 * has to know its own index. The context value is memoised: without it, every consumer of every
 * player re-rendered whenever any single player's volume moved.
 */
export const PlayerControlsProvider = ({ children, playerId }: PlayerControlsProviderProps) => {
    const { presetState, localVolumes, masterVolumeModifier, fadeAnimations } = useStackState();
    const { debouncedPresetDispatch, localVolumesDispatch, fadeAnimationsDispatch } = useStackActions();

    const framePlayer = usePlayerHolderById(playerId).player as IFPlayer;

    const [savedVolume, setSavedVolume] = useState<SavedVolume>({ hasSaved: false, prevVol: 0 });

    const playerInPreset = presetState.players[playerId];
    const selected = playerInPreset?.selected ?? false;
    const localVolume = localVolumes.volume[playerId];
    const fadeAnimationHandle = fadeAnimations.fadeAnimationHandles[playerId];

    const setFadeAnimationHandle = useCallback(
        (animId: number | null) =>
            fadeAnimationsDispatch({
                type: 'setFadeAnimationHandle',
                index: playerId,
                payload: animId,
            }),
        [fadeAnimationsDispatch, playerId],
    );

    const setSelected = useCallback(
        () =>
            debouncedPresetDispatch({
                type: selected ? 'deselect' : 'select',
                index: playerId,
            }),
        [debouncedPresetDispatch, selected, playerId],
    );

    const setLocalVolume = useCallback(
        (vol: number) => {
            if (!framePlayer) return;

            localVolumesDispatch({
                type: 'setVolume',
                index: playerId,
                payload: vol,
            });
            debouncedPresetDispatch({
                type: 'setVolume',
                index: playerId,
                payload: vol,
            });
        },
        [framePlayer, localVolumesDispatch, debouncedPresetDispatch, playerId],
    );

    useEffect(() => {
        if (!framePlayer || framePlayer?.setVolume === undefined) {
            return;
        }
        framePlayer.setVolume(localVolume * masterVolumeModifier);
    }, [framePlayer, localVolume, masterVolumeModifier]);

    const value = useMemo<PlayerControlsProviderType>(
        () => ({
            playerId,
            framePlayer,
            selected,
            setSelected,
            localVolume,
            setLocalVolume,
            savedVolume,
            setSavedVolume,
            fadeAnimationHandle,
            setFadeAnimationHandle,
        }),
        [
            playerId,
            framePlayer,
            selected,
            setSelected,
            localVolume,
            setLocalVolume,
            savedVolume,
            fadeAnimationHandle,
            setFadeAnimationHandle,
        ],
    );

    return (
        <PlayerControlsContext.Provider value={value}>
            {children}
        </PlayerControlsContext.Provider>
    );
};

export function usePlayerControls() {
    const context = useContext(PlayerControlsContext);
    if (!context) {
        throw new Error('usePlayerControls must be used within a PlayerControlsProvider');
    }
    return context;
}
