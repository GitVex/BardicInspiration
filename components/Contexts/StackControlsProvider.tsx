// StackControlsProvider.tsx
import React, {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useReducer,
    useState,
} from 'react';
import { DebouncedState, useDebounceCallback } from 'usehooks-ts';
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

/**
 * Everything that changes as the stack is used. Subscribing to this re-renders on every volume
 * tick, so consumers should take it only if they actually read one of these values.
 */
export interface StackState {
    presetState: PresetState;
    localVolumes: LocalVolumesState;
    masterVolume: number;
    masterVolumeModifier: number;
    fadeAnimations: FadeAnimationsState;
    disablePersistPreset: boolean;
}

/**
 * Everything that mutates the stack. Held in its own context because the identities are stable
 * for the provider's whole lifetime: a component that only dispatches never has to re-render
 * because some other player's volume moved.
 */
export interface StackActions {
    presetDispatch: React.Dispatch<PlayerStateAction>;
    debouncedPresetDispatch: DebouncedState<React.Dispatch<PlayerStateAction>>;
    localVolumesDispatch: React.Dispatch<LocalVolumesAction>;
    fadeAnimationsDispatch: React.Dispatch<FadeAnimationsAction>;
    setMasterVolume: React.Dispatch<React.SetStateAction<number>>;
    setDisablePersistPreset: React.Dispatch<React.SetStateAction<boolean>>;
    clearPreset: () => void;
    savePersistPresetPref: (preference: boolean) => void;
}

const StackStateContext = createContext<StackState | null>(null);
const StackActionsContext = createContext<StackActions | null>(null);

// playerCount must match the PresetProvider/PlayerHolderProvider it sits between.
export const StackControlsProvider = ({ children, playerCount = DEFAULT_PLAYER_COUNT }: {
    children: ReactNode;
    playerCount?: number;
}) => {
    const { presetState, presetDispatch } = usePreset();

    const debouncedPresetDispatch = useDebounceCallback(presetDispatch, 1000);

    const [localVolumes, localVolumesDispatch] = useReducer(localVolumesReducer, playerCount, createInitialVolumes);
    const [masterVolume, setMasterVolume] = useState(presetState.masterVolume);
    const [fadeAnimations, fadeAnimationsDispatch] = useReducer(
        fadeAnimationsReducer,
        playerCount,
        createInitialFadeAnimations,
    );
    const [disablePersistPreset, setDisablePersistPreset] = useState(GLOBAL_DISABLE_SAVE_PRESET);

    // Derived from masterVolume rather than mirrored in state - a second useState here meant every
    // master volume change cost two renders and could be read one render stale in between.
    const masterVolumeModifier = masterVolume / 100;

    useEffect(() => {
        debouncedPresetDispatch({ type: 'setMasterVolume', payload: masterVolume });
    }, [masterVolume, debouncedPresetDispatch]);

    // Persist Preferences
    useEffect(() => {
        setDisablePersistPreset(loadPersistPresetPref());
    }, []);

    // ------- PRESET STATE PERSISTENCE -------
    // Restores the saved preset once, on mount. Intentionally has no dependencies: presetState is
    // read here only to supply the fallback, and re-running on every change would clobber the
    // session with whatever was last written to localStorage.
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const state = useMemo<StackState>(
        () => ({
            presetState,
            localVolumes,
            masterVolume,
            masterVolumeModifier,
            fadeAnimations,
            disablePersistPreset,
        }),
        [presetState, localVolumes, masterVolume, masterVolumeModifier, fadeAnimations, disablePersistPreset],
    );

    // Every member is stable, so this object is built once and the actions context never changes
    const actions = useMemo<StackActions>(
        () => ({
            presetDispatch,
            debouncedPresetDispatch,
            localVolumesDispatch,
            fadeAnimationsDispatch,
            setMasterVolume,
            setDisablePersistPreset,
            clearPreset,
            savePersistPresetPref,
        }),
        [presetDispatch, debouncedPresetDispatch],
    );

    return (
        <StackActionsContext.Provider value={actions}>
            <StackStateContext.Provider value={state}>
                {children}
            </StackStateContext.Provider>
        </StackActionsContext.Provider>
    );
};

/** Subscribes to the live stack state. Re-renders whenever any of it changes. */
export function useStackState(): StackState {
    const context = useContext(StackStateContext);
    if (!context) {
        throw new Error('useStackState must be used within a StackControlsProvider');
    }
    return context;
}

/** Subscribes to the dispatchers only. Never causes a re-render on its own. */
export function useStackActions(): StackActions {
    const context = useContext(StackActionsContext);
    if (!context) {
        throw new Error('useStackActions must be used within a StackControlsProvider');
    }
    return context;
}

/**
 * State and actions together, for the few consumers that genuinely need both. Prefer
 * useStackActions where a component only dispatches - this hook re-renders on every state change.
 */
export function useStackControls(): StackState & StackActions {
    const state = useStackState();
    const actions = useStackActions();

    return useMemo(() => ({ ...state, ...actions }), [state, actions]);
}
