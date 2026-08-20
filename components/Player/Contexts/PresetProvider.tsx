// PresetProvider.tsx
import React, { useContext, useMemo, useReducer } from 'react';
import { PlayerStateAction, playerStateReducer, PresetState } from './states';
import { DEFAULT_PLAYER_COUNT, DEFAULT_VIDEO_ID, DEFAULT_VOLUME } from '../../utils/DEFAULTS';

interface PresetContextType {
    presetState: PresetState;
    presetDispatch: React.Dispatch<PlayerStateAction>;
}

// ----------------- CONTEXT DECLARATION -----------------
// null rather than `{} as PresetContextType`: an empty object satisfies the type but leaves every
// field undefined, so a consumer mounted outside the provider fails somewhere far away instead of
// at the useContext call that is actually wrong.
const PresetStateContext = React.createContext<PresetContextType | null>(null);

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
                startSeconds: 0,
                endSeconds: null,
                fadeDurationMs: null,
            })),
        masterVolume: 100,
    };
}

// ----------------- HOOKS -----------------
export function usePreset(): PresetContextType {
    const context = useContext(PresetStateContext);
    if (!context) {
        throw new Error('usePreset must be used within a PresetProvider');
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

    // presetDispatch is stable, so this changes only when the preset itself does
    const value = useMemo(() => ({ presetState, presetDispatch }), [presetState]);

    return (
        <PresetStateContext.Provider value={value}>
            {children}
        </PresetStateContext.Provider>
    );
}
