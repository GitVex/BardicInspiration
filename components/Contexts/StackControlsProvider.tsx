// StackControlsProvider.tsx
import React, {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useReducer,
    useRef,
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
import { usePlayerHolder } from './PlayerHolderProvider';
import { fadeIn, fadeOut } from '../Player/fadeFunctions';

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
    /** Whether mute and solo ramp the volume instead of cutting it. */
    fadeTransitions: boolean;
    /** The player currently soloed, if any. */
    soloedPlayerId: number | null;
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
    setFadeTransitions: React.Dispatch<React.SetStateAction<boolean>>;
    /** Silences a player if it is audible, restores it if it is not. */
    toggleMute: (playerId: number) => void;
    /** Silences every other playing player, or restores them if this player is already soloed. */
    toggleSolo: (playerId: number) => void;
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
    const [fadeTransitions, setFadeTransitions] = useState(false);
    const [soloedPlayerId, setSoloedPlayerId] = useState<number | null>(null);

    const { holders } = usePlayerHolder();

    // toggleMute and toggleSolo have to keep stable identities, or the actions context would change
    // on every volume tick and undo the whole point of splitting it from state. They read the live
    // values through this ref instead of closing over them.
    const liveRef = useRef({ presetState, localVolumes, fadeAnimations, holders, fadeTransitions, soloedPlayerId });
    liveRef.current = { presetState, localVolumes, fadeAnimations, holders, fadeTransitions, soloedPlayerId };

    // Which players the current solo silenced, so un-soloing restores exactly those and leaves
    // anything the user had already muted alone.
    const soloSilencedRef = useRef<number[]>([]);

    const setPlayerSilenced = useCallback((playerId: number, silence: boolean) => {
        const live = liveRef.current;
        const framePlayer = live.holders[playerId]?.player;
        if (!framePlayer) return;

        const volume = live.localVolumes.volume[playerId] ?? 0;
        const savedVolume = live.presetState.players[playerId]?.savedVolume
            ?? { hasSaved: false, prevVol: DEFAULT_VOLUME };

        const localVolumeControl = {
            localVolume: volume,
            setLocalVolume: (vol: number) =>
                localVolumesDispatch({ type: 'setVolume', index: playerId, payload: vol }),
        };
        const savedVolumeControl = {
            savedVolume,
            setSavedVolume: (next: { hasSaved: boolean; prevVol: number }) =>
                presetDispatch({ type: 'setSavedVolume', index: playerId, payload: next }),
        };
        const fadeAnimationControl = {
            fadeAnimationHandle: live.fadeAnimations.fadeAnimationHandles[playerId],
            setFadeAnimationHandle: (handle: number | null) =>
                fadeAnimationsDispatch({ type: 'setFadeAnimationHandle', index: playerId, payload: handle }),
        };

        if (silence) {
            if (volume <= 0) return;

            if (live.fadeTransitions) {
                // fadeOut already stores the level it started from and pauses once it reaches 0
                fadeOut({ framePlayer, localVolumeControl, savedVolumeControl, fadeAnimationControl, pLimit: 0 });
            } else {
                savedVolumeControl.setSavedVolume({ hasSaved: true, prevVol: volume });
                localVolumeControl.setLocalVolume(0);
                framePlayer.pauseVideo();
            }
            return;
        }

        const target = savedVolume.hasSaved && savedVolume.prevVol > 0 ? savedVolume.prevVol : DEFAULT_VOLUME;

        if (live.fadeTransitions) {
            fadeIn({ framePlayer, localVolumeControl, savedVolumeControl, fadeAnimationControl, pLimit: target });
        } else {
            localVolumeControl.setLocalVolume(target);
            framePlayer.playVideo();
        }
    }, [localVolumesDispatch, presetDispatch, fadeAnimationsDispatch]);

    const toggleMute = useCallback((playerId: number) => {
        const volume = liveRef.current.localVolumes.volume[playerId] ?? 0;
        setPlayerSilenced(playerId, volume > 0);
    }, [setPlayerSilenced]);

    const toggleSolo = useCallback((playerId: number) => {
        const live = liveRef.current;

        // Un-solo: give back everything this solo took away
        if (live.soloedPlayerId === playerId) {
            soloSilencedRef.current.forEach(id => setPlayerSilenced(id, false));
            soloSilencedRef.current = [];
            setSoloedPlayerId(null);
            return;
        }

        // Moving the solo to another player. Restoring everything and re-silencing would read
        // volumes that have not been dispatched yet, so only the two players that actually change
        // are touched: the new target comes back, the old one goes quiet.
        if (live.soloedPlayerId !== null) {
            setPlayerSilenced(playerId, false);
            setPlayerSilenced(live.soloedPlayerId, true);

            const stillSilenced = soloSilencedRef.current.filter(id => id !== playerId);
            if (!stillSilenced.includes(live.soloedPlayerId)) stillSilenced.push(live.soloedPlayerId);
            soloSilencedRef.current = stillSilenced;

            setSoloedPlayerId(playerId);
            return;
        }

        const silenced: number[] = [];
        live.presetState.players.forEach((_, id) => {
            if (id === playerId) return;

            const other = live.holders[id]?.player;
            // Only players actually making sound. Restoring calls playVideo, which would otherwise
            // start something the user had deliberately left paused.
            if (!other || other.getPlayerState?.() !== YT.PlayerState.PLAYING) return;
            if ((live.localVolumes.volume[id] ?? 0) <= 0) return;

            setPlayerSilenced(id, true);
            silenced.push(id);
        });

        soloSilencedRef.current = silenced;
        setSoloedPlayerId(playerId);
    }, [setPlayerSilenced]);

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
            fadeTransitions,
            soloedPlayerId,
        }),
        [
            presetState,
            localVolumes,
            masterVolume,
            masterVolumeModifier,
            fadeAnimations,
            disablePersistPreset,
            fadeTransitions,
            soloedPlayerId,
        ],
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
            setFadeTransitions,
            toggleMute,
            toggleSolo,
            clearPreset,
            savePersistPresetPref,
        }),
        [presetDispatch, debouncedPresetDispatch, toggleMute, toggleSolo],
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
