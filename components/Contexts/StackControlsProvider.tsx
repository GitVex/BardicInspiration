// PlayerContext.tsx
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useReducer, useState } from 'react';
import { useDebounceCallback } from 'usehooks-ts';
import {
    FadeAnimationsAction,
    fadeAnimationsReducer,
    FadeAnimationsState,
    LocalVolumesAction,
    localVolumesReducer,
    LocalVolumesState,
} from '../Player/types/states';
import { PlayerStateAction, PresetState } from '../Player/Contexts/states';
import { DEFAULT_VOLUME, GLOBAL_DISABLE_SAVE_PRESET } from '../utils/DEFAULTS';
import { usePreset } from '../Player/Contexts/PresetProvider';

const initialFadeAnimations: FadeAnimationsState = {
    fadeAnimationHandles: Array(9).fill(null),
};

const initialVolumes: LocalVolumesState = {
    volume: Array(8).fill(DEFAULT_VOLUME),
};

interface StackControlsProviderType {
    presetState: PresetState;
    presetDispatch: React.Dispatch<PlayerStateAction>;
    debouncedPresetDispatch: any;
    localVolumes: LocalVolumesState;
    localVolumesDispatch: React.Dispatch<LocalVolumesAction>;
    masterVolume: number;
    setMasterVolume: React.Dispatch<React.SetStateAction<number>>;
    masterVolumeModifier: number;
    fadeAnimations: FadeAnimationsState;
    fadeAnimationsDispatch: React.Dispatch<FadeAnimationsAction>;
}

const StackControlsContext = createContext<StackControlsProviderType | null>(null);

export const StackControlsProvider = ({ children }: { children: ReactNode }) => {
    const { presetState, presetDispatch } = usePreset();

    const debouncedPresetDispatch = useDebounceCallback(presetDispatch, 1000);

    const [localVolumes, localVolumesDispatch] = useReducer(localVolumesReducer, initialVolumes);
    const [masterVolume, setMasterVolume] = useState(presetState.masterVolume);
    const [masterVolumeModifier, setMasterVolumeModifier] = useState(presetState.masterVolume / 100);
    const [fadeAnimations, fadeAnimationsDispatch] = useReducer(fadeAnimationsReducer, initialFadeAnimations);

    useEffect(() => {
        setMasterVolumeModifier(masterVolume / 100);
        debouncedPresetDispatch({ type: 'setMasterVolume', payload: masterVolume });
    }, [masterVolume, debouncedPresetDispatch]);

    return (
        <StackControlsContext.Provider
            value={{
                presetState,
                presetDispatch,
                debouncedPresetDispatch,
                localVolumes,
                localVolumesDispatch,
                masterVolume,
                setMasterVolume,
                masterVolumeModifier,
                fadeAnimations,
                fadeAnimationsDispatch,
            }}
        >
            {children}
        </StackControlsContext.Provider>
    );
};

export function useStackControls() {
    const context = useContext(StackControlsContext);
    if (!context) {
        throw new Error('useStackControls must be used within a StackControlsProvider');
    }
    return context;
}
