import { motion } from 'framer-motion';
import VolumeSlider from './VolumeSlider';
import { fadeIn, fadeInputHandler, fadeOut } from './fadeFunctions';
import { loadNewVideo } from '../utils/utils';
import { usePlayerControls } from './Contexts/PlayerControlsProvider';
import { useStackActions, useStackState } from '../Contexts/StackControlsProvider';
import { usePlayerHolder } from '../Contexts/PlayerHolderProvider';
import { useTrackByVideoId } from './hooks/useTrackByVideoId';
import { useVideoTitle } from './hooks/useVideoTitle';
import ScrollTitle from '../Viewer/ScrollTitle';
import { CARD_ACTION_EVENT, CardActionDetail } from './PlayerHotkeys';
import React, { useCallback, useEffect, useState } from 'react';

function PlayerComponent() {
    const { selected, setSelected, playerId, videoId, framePlayer, localVolume, setLocalVolume } =
        usePlayerControls();
    const { focusedPlayerId, masterVolumeModifier } = useStackState();
    const { debouncedPresetDispatch } = useStackActions();
    const { registerSlot } = usePlayerHolder();

    // The focused player is by definition selected - it is the last one selected - so yellow wins
    // over the red the rest of the selection carries.
    const focused = focusedPlayerId === playerId;
    const [showSettings, setShowSettings] = useState(false); // Toggle for Video ID

    // Only tracks in the library carry a colour, so a video loaded by id that was never submitted
    // stays untinted rather than falling back to some arbitrary hue.
    const { track } = useTrackByVideoId(videoId);
    const videoTitle = useVideoTitle(framePlayer, videoId, track?.title);

    // Actions the hotkeys cannot perform themselves, because they need this card's player and its
    // own fields. Delivered as a window event rather than threaded through context, so the
    // registry stays independent of how many cards exist.
    useEffect(() => {
        const onCardAction = (event: Event) => {
            const { playerId: target, action } = (event as CustomEvent<CardActionDetail>).detail;
            if (target !== playerId) return;

            if (action === 'flip') {
                setShowSettings(show => !show);
                return;
            }

            if (action === 'loadClipboard') {
                navigator.clipboard?.readText?.()
                    .then(text => {
                        if (!framePlayer || !text) return;
                        loadNewVideo(playerId, debouncedPresetDispatch, framePlayer, text.trim(),
                            localVolume * masterVolumeModifier);
                    })
                    .catch(() => {
                        // Firefox refuses clipboard reads outside extensions; fall back to the field
                        setShowSettings(true);
                    });
            }
        };

        window.addEventListener(CARD_ACTION_EVENT, onCardAction);
        return () => window.removeEventListener(CARD_ACTION_EVENT, onCardAction);
    }, [playerId, framePlayer, debouncedPresetDispatch, localVolume, masterVolumeModifier]);

    // The provider builds the iframe inside this wrapper. It must stay childless in JSX so React
    // never reconciles into a subtree the YouTube API owns.
    const slotRef = useCallback(
        (element: HTMLDivElement | null) => registerSlot(playerId, element),
        [registerSlot, playerId],
    );

    return (
        <motion.div
            // Use 'group' to handle hover effects
            className="group relative flex h-full w-full min-h-0 min-w-0 flex-row overflow-hidden rounded-xl border border-white/10 bg-gray-900 shadow-xl"
            animate={{
                // Subtle glow instead of harsh red border
                borderColor: focused
                    ? 'rgba(250, 204, 21, 0.9)'
                    : selected ? 'rgba(239, 68, 68, 0.8)' : 'rgba(255, 255, 255, 0.1)',
                boxShadow: focused
                    ? '0 0 15px rgba(250, 204, 21, 0.25)'
                    : selected ? '0 0 15px rgba(239, 68, 68, 0.2)' : 'none',
            }}
            onClick={(e) => {
                if (e.currentTarget === e.target) setSelected();
            }}
        >
            {/* Library tint. Sits behind both halves as the first positioned child, so it layers
                over the card's own background and reads through the translucent controls face,
                while the opaque video half stays untouched. */}
            {track && (
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0"
                    style={{ background: `linear-gradient(to top, ${track.color} 0%, transparent 75%)` }}
                />
            )}

            <button
                onClick={() => setShowSettings(!showSettings)}
                className="absolute top-1 right-1 z-20 rounded-full bg-black/50 p-1.5 text-xs text-white hover:bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"
            >
                {showSettings ?
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5"
                         stroke="currentColor" className="size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                    :
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5"
                         stroke="currentColor" className="size-4">
                        <path strokeLinecap="round" strokeLinejoin="round"
                              d="m19.5 4.5-15 15m0 0h11.25m-11.25 0V8.25" />
                    </svg>
                }
            </button>

            {/* Left Side: Video & Status. The slot declares 16:9 and takes its size from the card
                height, rather than inheriting whatever shape the controls happen to leave over.
                It stays put while the controls flip - the video keeps playing and stays visible. */}
            <div className="relative flex h-full w-1/2 shrink-0 items-center justify-center bg-black">
                <div
                    ref={slotRef}
                    className="relative aspect-video w-full max-h-full opacity-80 [&>iframe]:absolute [&>iframe]:inset-0 [&>iframe]:h-full [&>iframe]:w-full"
                />
            </div>

            {/* Right Side: the gear rotates this half about its vertical axis. perspective on the
                wrapper is what makes it read as a card turning rather than a flat squash. */}
            <div className="min-w-0 flex-1" style={{ perspective: 800 }}>
                <motion.div
                    className="relative h-full w-full"
                    style={{ transformStyle: 'preserve-3d' }}
                    animate={{ rotateY: showSettings ? 180 : 0 }}
                    transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                >
                    {/* Front: title over the mixing controls */}
                    <div
                        className="absolute inset-0 flex flex-col gap-1 bg-gray-800/50 p-2"
                        style={{ backfaceVisibility: 'hidden' }}
                    >
                        {/* truncate + maxWidth is ScrollTitle's contract: it measures scrollWidth
                            against clientWidth to decide whether hovering should scroll it. pr-5
                            keeps the text clear of the gear button that overlays this corner. */}
                        <div
                            className="w-full shrink-0 truncate pr-5 text-[11px] text-gray-300"
                            style={{ maxWidth: '100%' }}
                            title={videoTitle}
                        >
                            <ScrollTitle title={videoTitle} />
                        </div>

                        <div className="flex min-h-0 flex-1 flex-row gap-2">
                            <div className="flex min-h-0 w-1/2 flex-col items-center justify-center">
                                <VolumeSlider
                                    volumeControl={{ localVolume, setLocalVolume }}
                                    height={'100%'}
                                    opaque={false}
                                />
                            </div>

                            <div className="flex min-w-0 flex-1 flex-col items-stretch justify-center gap-1">
                                <FadeInButton />
                                <FadeToInput />
                                <FadeOutButton />
                            </div>
                        </div>

                        <TransportButtons />
                    </div>

                    {/* Back: per-slot settings, pre-rotated so it reads correctly once turned */}
                    <div
                        // The panel fits down to roughly a 700px viewport; below that the card is
                        // shorter than its four rows, so it scrolls rather than silently clipping
                        // the last control.
                        className="absolute inset-0 flex flex-col gap-1 overflow-y-auto bg-gray-800/80 p-2"
                        style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                    >
                        <SettingsPanel />
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}

export default PlayerComponent;

/**
 * The card's back face. It has roughly 153x136 to work with once the flip container's padding is
 * accounted for, so the controls carry placeholders instead of separate label rows and the whole
 * panel is sized in one place here rather than per-control.
 */
const fieldClass =
    'min-w-0 rounded bg-gray-900/70 px-1.5 py-0.5 text-[11px] text-gray-100 placeholder:text-gray-500 ' +
    'outline-none focus:ring-1 focus:ring-red-500/60 disabled:opacity-40';

// inline-flex + centring rather than relying on the button's text-align: Tailwind's preflight sets
// svg { display: block }, and a block child ignores text-align, so an icon-only button would sit
// its icon flush left once the button is wider than the icon.
const buttonClass =
    'inline-flex shrink-0 items-center justify-center rounded bg-gray-700/70 px-1.5 py-0.5 ' +
    'text-[11px] text-gray-100 hover:bg-gray-600/70 disabled:opacity-40 transition-colors';

/** Seconds as typed, falling back to the committed value when the field holds nonsense. */
function parseSeconds(raw: string, fallback: number | null): number | null {
    if (raw.trim() === '') return null;
    const parsed = Number.parseFloat(raw);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function SettingsPanel() {
    const { framePlayer, startSeconds, endSeconds, setOffsets, fadeDurationMs, setFadeDuration } =
        usePlayerControls();

    // Held locally so a half-typed value never reaches the preset
    const [start, setStart] = useState(String(startSeconds));
    const [end, setEnd] = useState(endSeconds === null ? '' : String(endSeconds));

    // Follow the committed values when something else changes them - loading a different video
    // clears the offsets, and the fields would otherwise keep showing the old track's numbers.
    // Typing does not move the committed value, so this never fights the user mid-edit.
    useEffect(() => setStart(String(startSeconds)), [startSeconds]);
    useEffect(() => setEnd(endSeconds === null ? '' : String(endSeconds)), [endSeconds]);

    const canCapture = typeof framePlayer?.getCurrentTime === 'function';

    /**
     * Captures the playhead into one offset and commits both, so grabbing a start never discards
     * an end the user has already typed. Each field falls back to its committed value when it
     * holds something unparseable.
     */
    const captureInto = (field: 'start' | 'end') => () => {
        if (!canCapture) return;

        const now = Math.round(framePlayer.getCurrentTime() * 10) / 10;

        const nextStart = field === 'start' ? now : parseSeconds(start, startSeconds) ?? 0;
        const nextEnd = field === 'end' ? now : parseSeconds(end, endSeconds);

        setStart(String(nextStart));
        setEnd(nextEnd === null ? '' : String(nextEnd));
        setOffsets({ startSeconds: nextStart, endSeconds: nextEnd });
    };

    // Typed edits commit on blur; the capture buttons commit immediately
    const commitTyped = () =>
        setOffsets({
            startSeconds: parseSeconds(start, startSeconds) ?? 0,
            endSeconds: parseSeconds(end, endSeconds),
        });

    return (
        <>
            <LoadVideoInput />

            <div className="flex flex-row items-center gap-1">
                <input
                    type="text"
                    inputMode="decimal"
                    className={`${fieldClass} w-0 flex-1`}
                    placeholder="Start s"
                    value={start}
                    onChange={e => setStart(e.target.value)}
                    onBlur={commitTyped}
                />
                <button
                    className={buttonClass}
                    onClick={captureInto('start')}
                    disabled={!canCapture}
                    title="Set start to current time"
                >
                    Now
                </button>
            </div>

            <div className="flex flex-row items-center gap-1">
                <input
                    type="text"
                    inputMode="decimal"
                    className={`${fieldClass} w-0 flex-1`}
                    placeholder="End s"
                    value={end}
                    onChange={e => setEnd(e.target.value)}
                    onBlur={commitTyped}
                />
                <button
                    className={buttonClass}
                    onClick={captureInto('end')}
                    disabled={!canCapture}
                    title="Set end to current time"
                >
                    Now
                </button>
            </div>

            <input
                type="text"
                inputMode="numeric"
                className={fieldClass}
                placeholder="Fade ms (auto)"
                defaultValue={fadeDurationMs === null ? '' : String(fadeDurationMs)}
                onBlur={e => {
                    const parsed = Number.parseInt(e.target.value, 10);
                    setFadeDuration(Number.isFinite(parsed) && parsed > 0 ? parsed : null);
                }}
            />

            <button
                className={`${buttonClass} mt-auto w-full`}
                onClick={() => {/* opens this player's queue in the expanded panel */}}
            >
                Queue …
            </button>
        </>
    );
}

function LoadVideoInput() {
    const { playerId, framePlayer, localVolume } = usePlayerControls();
    const { masterVolumeModifier } = useStackState();
    const { debouncedPresetDispatch } = useStackActions();

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key !== 'Enter') return;
        if (!framePlayer) return;
        loadNewVideo(
            playerId,
            debouncedPresetDispatch,
            framePlayer,
            (e.target as HTMLInputElement).value,
            localVolume * masterVolumeModifier,
        );
    };

    return <input
        type="text"
        className={fieldClass}
        placeholder="Video ID / URL ⏎"
        onKeyDown={handleKeyDown}
    />;
}

/**
 * The fade controls all need the same six pieces of player state and assemble the same options
 * object, so they share one hook rather than each destructuring the context by hand.
 */
function useFadeControls() {
    const {
        framePlayer,
        localVolume,
        setLocalVolume,
        savedVolume,
        setSavedVolume,
        fadeAnimationHandle,
        setFadeAnimationHandle,
        fadeDurationMs,
    } = usePlayerControls();

    return {
        framePlayer,
        fadeOptions: {
            framePlayer,
            localVolumeControl: { localVolume, setLocalVolume },
            savedVolumeControl: { savedVolume, setSavedVolume },
            fadeAnimationControl: { fadeAnimationHandle, setFadeAnimationHandle },
            durationMs: fadeDurationMs,
        },
    };
}

function FadeInButton() {
    const { framePlayer, fadeOptions } = useFadeControls();

    return <button
        className={`${buttonClass} p-1`}
        onClick={() => fadeIn(fadeOptions)}
        disabled={!framePlayer}
        title="Fade in"
    >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"
             className="size-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 18.75 7.5-7.5 7.5 7.5" />
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 7.5-7.5 7.5 7.5" />
        </svg>
    </button>;
}

/**
 * The mouse's way to a target volume. The keyboard's way is T, which opens a prompt that never
 * takes focus at all - see PlayerHotkeys - and both end up in fadeToVolume, so they cannot
 * disagree about what a target means.
 */
function FadeToInput() {
    const { framePlayer, fadeOptions } = useFadeControls();

    /**
     * Enter fires the fade and Escape abandons it, and both hand focus back to the document.
     *
     * Without that the field is a dead end: while it holds focus the hotkey listener's typing
     * guard swallows every binding, so the only way out is the mouse.
     */
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Escape') {
            // Stopped here rather than left to bubble, so the global Escape does not also read it
            // as "close the player"
            e.preventDefault();
            e.currentTarget.blur();
            return;
        }

        fadeInputHandler(e, fadeOptions);
        if (e.key === 'Enter') e.currentTarget.blur();
    };

    return <input
        type="text"
        inputMode="numeric"
        className={`${fieldClass} w-full text-center`}
        placeholder="Fade to"
        onKeyDown={handleKeyDown}
        // The last target is kept as a hint of where this player was put, but arrives selected so
        // typing replaces it instead of appending to it
        onFocus={e => e.currentTarget.select()}
        disabled={!framePlayer}
    />;
}

function FadeOutButton() {
    const { framePlayer, fadeOptions } = useFadeControls();

    return <button
        className={`${buttonClass} p-1`}
        onClick={() => fadeOut({ ...fadeOptions, pLimit: 0 })}
        disabled={!framePlayer}
        title="Fade out"
    >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"
             className="size-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 5.25 7.5 7.5 7.5-7.5m-15 6 7.5 7.5 7.5-7.5" />
        </svg>
    </button>;
}

/**
 * Transport pair. Both operate on the stack rather than this player alone - solo has to reach
 * every other player - so the work lives in StackControls and this only reflects the result.
 */
function TransportButtons() {
    const { framePlayer, playerId, localVolume } = usePlayerControls();
    const { soloedPlayerIds, fadeTransitions } = useStackState();
    const { toggleMute, toggleSolo } = useStackActions();

    const muted = localVolume <= 0;
    const soloed = soloedPlayerIds.includes(playerId);
    const verb = fadeTransitions ? 'Fade' : 'Cut';

    return (
        <div className="flex shrink-0 flex-row gap-1">
            <button
                className={`${buttonClass} flex-1 ${muted ? 'bg-red-800/70 hover:bg-red-700/70' : ''}`}
                onClick={() => toggleMute(playerId)}
                disabled={!framePlayer}
                title={muted ? 'Unmute' : `${verb} this player out`}
            >
                {muted ? 'Unmute' : 'Mute'}
            </button>
            <button
                className={`${buttonClass} flex-1 ${soloed ? 'bg-red-800/70 hover:bg-red-700/70' : ''}`}
                onClick={() => toggleSolo([playerId])}
                disabled={!framePlayer}
                title={soloed ? 'Bring the other players back' : `${verb} every other playing player out`}
            >
                Solo
            </button>
        </div>
    );
}
