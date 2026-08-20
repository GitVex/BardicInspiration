import React, { useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import IFPlayer from '../Player/types/IFPlayer';
import { PlayerHolder, playerHolderReducer, PlayerHolderState } from './states';
import { usePreset } from '../Player/Contexts/PresetProvider';
import { loadYouTubeApi } from '../Player/ytApiLoader';

import { DEFAULT_PLAYER_COUNT, DEFAULT_VIDEO_ID, DEFAULT_VOLUME } from '../utils/DEFAULTS';

// YT.PlayerState.UNSTARTED = -1;
// YT.PlayerState.ENDED = 0;
// YT.PlayerState.PLAYING = 1;
// YT.PlayerState.PAUSED = 2;
// YT.PlayerState.BUFFERING = 3;
// YT.PlayerState.CUED = 5;

// https://developers.google.com/youtube/iframe_api_reference?

// ----------------- CONTEXT DECLARATION -----------------
// Create a custom hook to handle the initialization of multiple YouTube iframe players on a page
// This is a workaround for the fact that the YouTube iframe api only allows one api call per mount
//
// Each PlayerComponent registers an empty wrapper element as its "slot". The players are built
// directly inside those slots, because the API replaces the element it is handed - letting it
// replace a node React rendered would leave React writing into a detached node. An iframe also
// cannot be built elsewhere and moved in afterwards: reparenting an iframe reloads it.
interface PlayerHolderContextType extends PlayerHolderState {
    registerSlot: (index: number, element: HTMLElement | null) => void;
}

// null rather than an empty object cast: a consumer mounted outside the provider should fail at
// the useContext call, not later on an undefined holders array.
const PlayerHolderContext = React.createContext<PlayerHolderContextType | null>(null);

// ----------------- INITIAL STATES -----------------
function createInitialPlayerHolderState(playerCount: number): PlayerHolderState {
    return {
        holders: Array(playerCount)
            .fill(null)
            .map((_, index) => ({
                id: index,
                player: null,
                isReady: false,
            })),
        firstLoadDone: false,
    };
}

// ----------------- HOOKS -----------------
export function usePlayerHolder(): PlayerHolderContextType {
    const context = useContext(PlayerHolderContext);
    if (!context) {
        throw new Error('usePlayerHolder must be used within a PlayerHolderProvider');
    }
    return context;
}

export function usePlayerHolderById(id: number): PlayerHolder {
    const { holders } = usePlayerHolder();

    // An id outside the stack gets an inert holder rather than a throw: callers treat a null
    // player as "not ready yet", which is the same thing as far as they are concerned.
    return holders[id] ?? { id: -1, player: null, isReady: false };
}

// ----------------- PROVIDER -----------------
// playerCount is read once, on mount - changing it afterwards is not supported. It exists so the
// /test sandbox can mount a single player without waiting on eight slots that never appear.
function PlayerHolderProvider({ children, playerCount = DEFAULT_PLAYER_COUNT }: {
    children: React.ReactNode;
    playerCount?: number;
}) {

    const { presetDispatch } = usePreset();

    // ------- YT IFRAME API INIT -------
    const [playerHolder, dispatchPlayerHolder] = useReducer(
        playerHolderReducer,
        playerCount,
        createInitialPlayerHolderState,
    );

    const slotsRef = useRef<(HTMLElement | null)[]>(Array(playerCount).fill(null));
    const playersRef = useRef<(IFPlayer | null)[]>(Array(playerCount).fill(null));
    const [slotsVersion, setSlotsVersion] = useState(0);

    const registerSlot = useCallback((index: number, element: HTMLElement | null) => {
        if (!Number.isInteger(index) || index < 0 || index >= slotsRef.current.length) return;
        if (slotsRef.current[index] === element) return;

        slotsRef.current[index] = element;
        setSlotsVersion(version => version + 1);
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const slots = slotsRef.current;
        // Wait until every PlayerComponent has handed us its wrapper
        if (slots.some(slot => !slot)) return;
        // playersRef is a ref rather than state so the guard is accurate immediately,
        // instead of a render behind
        if (playersRef.current.some(Boolean)) return;

        let cancelled = false;

        // paused state: 2, playing state: 1
        function onPlayerStateChange(playerIdx: number, player: IFPlayer) {
            const changedState = player.getPlayerState();

            if (changedState === YT.PlayerState.PAUSED) {
                presetDispatch(
                    {
                        type: 'setPausedAt',
                        index: playerIdx,
                        payload: Date.now(),
                    },
                );
            } else if (changedState === YT.PlayerState.UNSTARTED) {
                presetDispatch(
                    {
                        type: 'setPausedAt',
                        index: playerIdx,
                        payload: Date.now(),
                    },
                );
            } else if (changedState === YT.PlayerState.PLAYING) {
                presetDispatch(
                    {
                        type: 'setPausedAt',
                        index: playerIdx,
                        payload: 9999999999999,
                    },
                );
            } else if (changedState === YT.PlayerState.ENDED) {
                player.seekTo(0, true);
            }
        }

        function onPlayerReady(playerIdx: number, player: IFPlayer) {
            // No play-then-pause priming. Starting playback and pausing it on a timer races the
            // video's own load: when the pause lands before the first frame is painted, the iframe
            // is left black with no controls, and only playing it again brings it back. The video
            // is cued at construction, so it already shows its poster and controls - leave it be.
            player.setVolume(DEFAULT_VOLUME);

            dispatchPlayerHolder({
                type: 'setReady',
                index: playerIdx,
            });
        }

        loadYouTubeApi().then(YTApi => {
            if (cancelled) return;

            slots.forEach((slot, index) => {
                // The API replaces the element it is given, so hand it a throwaway child of the
                // slot. The slot itself is rendered by React and has no JSX children, so React
                // never reconciles inside it.
                const target = document.createElement('div');
                slot!.appendChild(target);

                const player = new YTApi.Player(target, {
                    width: '100%',
                    height: '100%',
                    videoId: DEFAULT_VIDEO_ID,
                    playerVars: {
                        fs: 0,
                        enablejsapi: 1,
                        playsinline: 1,
                        origin: window.location.origin,
                    },
                    events: {
                        onStateChange: e => onPlayerStateChange(index, e.target as IFPlayer),
                        onReady: e => onPlayerReady(index, e.target as IFPlayer),
                    },
                }) as IFPlayer;

                playersRef.current[index] = player;

                // Dispatched per index rather than as one wholesale init, so a setReady that
                // lands first cannot be overwritten
                dispatchPlayerHolder({
                    type: 'setPlayer',
                    index,
                    payload: player,
                });
            });

            dispatchPlayerHolder({ type: 'setFirstLoadDone' });
        });

        return () => {
            cancelled = true;
            playersRef.current.forEach(player => player?.destroy?.());
            playersRef.current = Array(playerCount).fill(null);
        };
    }, [slotsVersion, presetDispatch, playerCount]);

    // ------- LISTENERS -------

    /* useEffect(() => {
        console.log('presetState changed', presetState);
    }, [presetState]); */

    /* useEffect(() => {
        console.log('playerHolder changed', playerHolder);
    }, [playerHolder]); */

    // registerSlot is stable, so this changes only when a player is built or becomes ready
    const value = useMemo<PlayerHolderContextType>(
        () => ({
            holders: playerHolder.holders,
            firstLoadDone: playerHolder.firstLoadDone,
            registerSlot,
        }),
        [playerHolder.holders, playerHolder.firstLoadDone, registerSlot],
    );

    return (
        <PlayerHolderContext.Provider value={value}>
            {children}
        </PlayerHolderContext.Provider>
    );
}

export default PlayerHolderProvider;
