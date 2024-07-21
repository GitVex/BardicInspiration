// PlayerContext.tsx
import React, { createContext, useReducer, useState, useContext, useEffect, ReactNode } from 'react';
import { useDebounceCallback } from 'usehooks-ts';
import {
    FadeIntervalsState,
    FadeIntervalsAction,
    LocalVolumesState,
    LocalVolumesAction,
    fadeIntervalsReducer,
    localVolumesReducer,
} from '../types/states';
import { PresetState, PlayerStateAction } from '../../Contexts/states';
import { usePresetState } from '../../Contexts/PlayerHolderProvider';
import { DEFAULT_VOLUME } from '../../utils/DEFAULTS';

const initialFadeIntervals: FadeIntervalsState = {
    fadeIntervals: Array(9).fill(null),
};

const initialVolumes: LocalVolumesState = {
    volume: Array(8).fill(DEFAULT_VOLUME),
};

interface PlayerControlsProviderType {
    presetState: PresetState;
    presetDispatch: React.Dispatch<PlayerStateAction>;
    debouncedPresetDispatch: any;
    disablePersistPreset: boolean;
    setDisablePersistPreset: React.Dispatch<React.SetStateAction<boolean>>;
    clearPersistPreset: () => void;
    localVolumes: LocalVolumesState;
    localVolumesDispatch: React.Dispatch<LocalVolumesAction>;
    masterVolume: number;
    setMasterVolume: React.Dispatch<React.SetStateAction<number>>;
    masterVolumeModifier: number;
    fadeIntervals: FadeIntervalsState;
    fadeIntervalDispatch: React.Dispatch<FadeIntervalsAction>;

}

const PlayerControlsContext = createContext<PlayerControlsProviderType | null>(null);

export const PlayerControlsProvider = ({ children }: { children: ReactNode }) => {
    const {
        presetState,
        presetDispatch,
        disablePersistPreset,
        setDisablePersistPreset,
        clearPersistPreset,
    } = usePresetState();
    const debouncedPresetDispatch = useDebounceCallback(presetDispatch, 1000);

    const [localVolumes, localVolumesDispatch] = useReducer(localVolumesReducer, initialVolumes);
    const [masterVolume, setMasterVolume] = useState(presetState.masterVolume);
    const [masterVolumeModifier, setMasterVolumeModifier] = useState(presetState.masterVolume / 100);
    const [fadeIntervals, fadeIntervalDispatch] = useReducer(fadeIntervalsReducer, initialFadeIntervals);

    useEffect(() => {
        setMasterVolumeModifier(masterVolume / 100);
        debouncedPresetDispatch({ type: 'setMasterVolume', payload: masterVolume });
    }, [masterVolume, debouncedPresetDispatch]);

    return (
        <PlayerControlsContext.Provider value={{
            presetState,
            presetDispatch,
            debouncedPresetDispatch,
            disablePersistPreset,
            setDisablePersistPreset,
            clearPersistPreset,
            localVolumes,
            localVolumesDispatch,
            masterVolume,
            setMasterVolume,
            masterVolumeModifier,
            fadeIntervals,
            fadeIntervalDispatch,
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