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
import { DEFAULT_PLAYER_COUNT, DEFAULT_VOLUME, GLOBAL_DISABLE_SAVE_PRESET } from '../utils/DEFAULTS';
import { clearPreset, loadPreset, savePreset } from './utils/presetlocalStorageUtils';
import { loadPersistPresetPref, savePersistPresetPref } from './utils/persistenceLocalStorageUtils';
import { usePreset } from '../Player/Contexts/PresetProvider';

const createInitialFadeAnimations = (playerCount: number): FadeAnimationsState => ({
    fadeAnimationHandles: Array(playerCount).fill(null),
});

const createInitialVolumes = (playerCount: number): LocalVolumesState => ({
    volume: Array(playerCount).fill(DEFAULT_VOLUME),
});

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
    disablePersistPreset: boolean;
    setDisablePersistPreset: React.Dispatch<React.SetStateAction<boolean>>;
    clearPreset: () => void;
    savePersistPresetPref: (preference: boolean) => void;
}

const StackControlsContext = createContext<StackControlsProviderType | null>(null);

// playerCount must match the PresetProvider/PlayerHolderProvider it sits between.
export const StackControlsProvider = ({ children, playerCount = DEFAULT_PLAYER_COUNT }: {
    children: ReactNode;
    playerCount?: number;
}) => {
    const { presetState, presetDispatch } = usePreset();

    const debouncedPresetDispatch = useDebounceCallback(presetDispatch, 1000);

    const [localVolumes, localVolumesDispatch] = useReducer(localVolumesReducer, playerCount, createInitialVolumes);
    const [masterVolume, setMasterVolume] = useState(presetState.masterVolume);
    const [masterVolumeModifier, setMasterVolumeModifier] = useState(presetState.masterVolume / 100);
    const [fadeAnimations, fadeAnimationsDispatch] = useReducer(
        fadeAnimationsReducer,
        playerCount,
        createInitialFadeAnimations,
    );
    const [disablePersistPreset, setDisablePersistPreset] = useState(GLOBAL_DISABLE_SAVE_PRESET);





    useEffect(() => {
        setMasterVolumeModifier(masterVolume / 100);
        debouncedPresetDispatch({ type: 'setMasterVolume', payload: masterVolume });
    }, [masterVolume, debouncedPresetDispatch]);

    // Persist Preferences
    useEffect(() => {
        setDisablePersistPreset(loadPersistPresetPref());
    }, []);

    // ------- PRESET STATE PERSISTENCE -------
    useEffect(() => {
        const saved = loadPreset(presetState);

        // A preset saved with a different number of players would resize presetState.players out
        // from under the providers, leaving dispatches pointed at indices that no longer exist
        if (saved.players?.length !== presetState.players.length) {
            console.warn(
                `Ignoring saved preset: it has ${saved.players?.length} players, this session has ${presetState.players.length}`,
            );
            return;
        }

        presetDispatch({
            type: 'setPreset',
            payload: saved,
        });
    }, []);

    const handleBeforeUnload = useCallback(
        (e: BeforeUnloadEvent) => {
            if (disablePersistPreset) return;
            savePreset(presetState);
            e.preventDefault();
            e.returnValue = '';
        },
        [disablePersistPreset, presetState],
    );

    useEffect(() => {
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [handleBeforeUnload]);

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
                disablePersistPreset,
                setDisablePersistPreset,
                clearPreset,
                savePersistPresetPref,
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
