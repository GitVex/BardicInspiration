// PresetProvider.tsx
import React, { useContext, useReducer } from 'react';
import { PlayerStateAction, playerStateReducer, PresetState } from './states';
import { DEFAULT_VIDEO_ID, DEFAULT_VOLUME } from '../../utils/DEFAULTS';


// ----------------- CONTEXT DECLARATION -----------------
const PresetStateContext = React.createContext(
    {} as {
        presetState: PresetState;
        presetDispatch: React.Dispatch<PlayerStateAction>;
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

    return (
        <PresetStateContext.Provider
            value={{
                presetState,
                presetDispatch,
            }}
        >
            {children}
        </PresetStateContext.Provider>
    );
}