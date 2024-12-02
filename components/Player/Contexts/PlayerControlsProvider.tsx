// PlayerContext.tsx
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { usePlayerHolderById } from '../../Contexts/PlayerHolderProvider';
import { useStackControls } from '../../Contexts/StackControlsProvider';
import IFPlayer from '../types/IFPlayer';

interface PlayerControlsProviderType {
    playerId: number;
    framePlayer: IFPlayer | null;
    selected: boolean;
    setSelected: () => void;
    localVolume: number;
    setLocalVolume: (vol: number) => void;
    savedVolume: { hasSaved: boolean, prevVol: number };
    setSavedVolume: (vol: { hasSaved: boolean, prevVol: number }) => void;
    fadeAnimationHandle: number | null;
    setFadeAnimationHandle: (animID: number | null) => void;
}

const PlayerControlsContext = createContext<PlayerControlsProviderType | null>(null);

interface PlayerControlsProviderProps {
    children: ReactNode;
    playerId: number;
}

export const PlayerControlsProvider = ({ children, playerId }: PlayerControlsProviderProps) => {
    const {
        presetState,
        debouncedPresetDispatch,
        localVolumes,
        localVolumesDispatch,
        masterVolumeModifier,
        fadeAnimations,
        fadeAnimationsDispatch,
    } = useStackControls();

    const playerInPreset = presetState.players[playerId];
    const framePlayer = usePlayerHolderById(playerId).player as IFPlayer;

    const [savedVolume, setSavedVolume] = useState({ hasSaved: false, prevVol: 0 });

    const fadeAnimationHandle = fadeAnimations.fadeAnimationHandles[playerId];
    const setFadeAnimationHandle = (animId: number | null) =>
        fadeAnimationsDispatch({
            type: 'setFadeAnimationHandle',
            index: playerId,
            payload: animId,
        });

    const selected = playerInPreset?.selected ?? false;
    const setSelected = () => {
        debouncedPresetDispatch?.({
            type: selected ? 'deselect' : 'select',
            index: playerId,
        });
    };

    const localVolume = localVolumes.volume[playerId];
    const setLocalVolume = (vol: number) => {
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
    };

    useEffect(() => {
        if (!framePlayer || framePlayer?.setVolume === undefined) {
            return;
        }
        framePlayer.setVolume(localVolume * masterVolumeModifier);
    }, [framePlayer, localVolume, masterVolumeModifier]);


    return (
        <PlayerControlsContext.Provider value={{
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
        }}>
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