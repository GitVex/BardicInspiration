// PresetProvider.tsx
import React, { useCallback, useContext, useEffect, useReducer, useState } from 'react';
import { PlayerStateAction, playerStateReducer, PresetState } from './states';
import { DEFAULT_VIDEO_ID, DEFAULT_VOLUME, GLOBAL_DISABLE_SAVE_PRESET } from '../../utils/DEFAULTS';
import { clearPreset, loadPreset, savePreset } from './localStorageUtils';

// ----------------- CONTEXT DECLARATION -----------------
const PresetStateContext = React.createContext(
    {} as {
        presetState: PresetState;
        presetDispatch: React.Dispatch<PlayerStateAction>;
        disablePersistPreset: boolean;
        setDisablePersistPreset: React.Dispatch<React.SetStateAction<boolean>>;
        clearPreset: () => void;
    },
);

// ----------------- INITIAL STATES -----------------

const initialPresetState: PresetState = {
    title: 'New Preset',
    players: Array(8)
        .fill(null)
        .map((_, index) => ({
            id: index,
            selected: false,
            volume: DEFAULT_VOLUME,
            savedVolume: { hasSaved: false, prevVol: DEFAULT_VOLUME },
            pausedAt: Date.now(),
            videoId: DEFAULT_VIDEO_ID,
        })),
    masterVolume: 100,
};

// ----------------- HOOKS -----------------
export function usePreset() {
    const context = useContext(PresetStateContext);
    if (context === undefined) {
        throw new Error('usePresetState must be used within a PresetStateContext');
    }
    return context;
}

export default function PresetProvider({ children }: { children: React.ReactNode }) {
    const [presetState, presetDispatch] = useReducer(playerStateReducer, initialPresetState);
    const [disablePersistPreset, setDisablePersistPreset] = useState(GLOBAL_DISABLE_SAVE_PRESET);

    // ------- PRESET STATE PERSISTENCE -------
    useEffect(() => {
        presetDispatch({
            type: 'setPreset',
            payload: loadPreset(initialPresetState),
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

    // ------- PAUSED TIMER -------

    const setPausedAt = (pIndex: number, pPayload: number) => {
        presetDispatch({
            type: 'setPausedAt',
            index: pIndex,
            payload: pPayload,
        });
    };


    return (
        <PresetStateContext.Provider
            value={{
                presetState,
                presetDispatch,
                disablePersistPreset,
                setDisablePersistPreset,
                clearPreset,
            }}
        >
            {children}
        </PresetStateContext.Provider>
    );
}