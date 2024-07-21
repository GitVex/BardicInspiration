// PlayerContext.tsx
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { usePlayerHolderById } from '../../Contexts/PlayerHolderProvider';
import { usePlayerControls } from './PlayerControlsProvider';
import IFPlayer from '../types/IFPlayer';

interface PlayerLocalControlsProviderType {
    playerId: number;
    framePlayer: IFPlayer | null;
    selected: boolean;
    setSelected: () => void;
    localVolume: number;
    setLocalVolume: (vol: number) => void;
    savedVolume: { hasSaved: boolean, prevVol: number };
    setSavedVolume: (vol: { hasSaved: boolean, prevVol: number }) => void;
    currentFadeInterval: NodeJS.Timeout | null;
    setCurrentFadeInterval: (interval: NodeJS.Timeout | null) => void;
}

const PlayerLocalControlsContext = createContext<PlayerLocalControlsProviderType | null>(null);

interface PlayerLocalControlsProviderProps {
    children: ReactNode;
    playerId: number;
}

export const PlayerLocalControlsProvider = ({ children, playerId }: PlayerLocalControlsProviderProps) => {
    const {
        presetState,
        debouncedPresetDispatch,
        localVolumes,
        localVolumesDispatch,
        masterVolumeModifier,
        fadeIntervals,
        fadeIntervalDispatch,
    } = usePlayerControls();

    const playerInPreset = presetState.players[playerId];
    const framePlayer = usePlayerHolderById(playerId).player as IFPlayer;

    const [savedVolume, setSavedVolume] = useState({ hasSaved: false, prevVol: 0 });

    const currentFadeInterval = fadeIntervals.fadeIntervals[playerId];
    const setCurrentFadeInterval = (interval: NodeJS.Timeout | null) =>
        fadeIntervalDispatch({
            type: 'setCurrentFadeInterval',
            index: playerId,
            payload: interval,
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
        <PlayerLocalControlsContext.Provider value={{
            playerId,
            framePlayer,
            selected,
            setSelected,
            localVolume,
            setLocalVolume,
            savedVolume,
            setSavedVolume,
            currentFadeInterval,
            setCurrentFadeInterval,
        }}>
            {children}
        </PlayerLocalControlsContext.Provider>
    );
};

export function usePlayerLocalControls() {
    const context = useContext(PlayerLocalControlsContext);
    if (!context) {
        throw new Error('local usePlayerControls must be used within a local PlayerControlsProvider');
    }
    return context;
}