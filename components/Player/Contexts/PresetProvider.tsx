// PresetProvider.tsx
import React, { useContext, useReducer } from 'react';
import { PlayerStateAction, playerStateReducer, PresetState } from './states';
import { DEFAULT_PLAYER_COUNT, DEFAULT_VIDEO_ID, DEFAULT_VOLUME } from '../../utils/DEFAULTS';


// ----------------- CONTEXT DECLARATION -----------------
const PresetStateContext = React.createContext(
    {} as {
        presetState: PresetState;
        presetDispatch: React.Dispatch<PlayerStateAction>;
    },
);

// ----------------- INITIAL STATES -----------------

export function createInitialPresetState(playerCount: number): PresetState {
    return {
        title: 'New Preset',
        players: Array(playerCount)
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
}

// ----------------- HOOKS -----------------
export function usePreset() {
    const context = useContext(PresetStateContext);
    if (context === undefined) {
        throw new Error('usePresetState must be used within a PresetStateContext');
    }
    return context;
}

// playerCount is read once, on mount. Remount the provider (a changing key) to resize the preset.
export default function PresetProvider({ children, playerCount = DEFAULT_PLAYER_COUNT }: {
    children: React.ReactNode;
    playerCount?: number;
}) {
    const [presetState, presetDispatch] = useReducer(
        playerStateReducer,
        playerCount,
        createInitialPresetState,
    );

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