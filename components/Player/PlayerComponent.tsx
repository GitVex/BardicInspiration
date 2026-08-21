import { motion } from 'framer-motion';
import VolumeSlider from './VolumeSlider';
import { fadeIn, fadeInputHandler, fadeOut } from './fadeFunctions';
import { loadNewVideo } from '../utils/utils';
import { usePlayerControls } from './Contexts/PlayerControlsProvider';
import { useStackActions, useStackState } from '../Contexts/StackControlsProvider';
import { usePlayerHolder } from '../Contexts/PlayerHolderProvider';
import { useTrackByVideoId } from './hooks/useTrackByVideoId';
import React, { useCallback, useEffect, useState } from 'react';

function PlayerComponent() {
    const { selected, setSelected, playerId, videoId, localVolume, setLocalVolume } = usePlayerControls();
    const { registerSlot } = usePlayerHolder();
    const [showSettings, setShowSettings] = useState(false); // Toggle for Video ID

    // Only tracks in the library carry a colour, so a video loaded by id that was never submitted
    // stays untinted rather than falling back to some arbitrary hue.
    const { track } = useTrackByVideoId(videoId);

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
                borderColor: selected ? 'rgba(239, 68, 68, 0.8)' : 'rgba(255, 255, 255, 0.1)',
                boxShadow: selected ? '0 0 15px rgba(239, 68, 68, 0.2)' : 'none',
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
                    {/* Front: mixing controls */}
                    <div
                        className="absolute inset-0 flex flex-row gap-2 bg-gray-800/50 p-2"
                        style={{ backfaceVisibility: 'hidden' }}
                    >
                        <div className="flex min-h-0 w-1/2 flex-col items-center justify-center py-2">
                            <VolumeSlider
                                volumeControl={{ localVolume, setLocalVolume }}
                                height={'100%'}
                                opaque={false}
                            />
                        </div>

                        <div className="flex flex-col items-center justify-center gap-1">
                            <FadeInButton />
                            <FadeToInput />
                            <FadeOutButton />
                        </div>
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

const buttonClass =
    'shrink-0 rounded bg-gray-700/70 px-1.5 py-0.5 text-[11px] text-gray-100 hover:bg-gray-600/70 ' +
    'disabled:opacity-40 transition-colors';

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

function FadeInButton() {
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

    return <button
        className="rounded bg-gray-900/70 p-1 disabled:opacity-50 w-min"
        onClick={() => {
            fadeIn({
                framePlayer,
                localVolumeControl: { localVolume, setLocalVolume },
                savedVolumeControl: { savedVolume, setSavedVolume },
                fadeAnimationControl: { fadeAnimationHandle, setFadeAnimationHandle },
                durationMs: fadeDurationMs,
            });
        }}
        disabled={!framePlayer}
    >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"
             className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 18.75 7.5-7.5 7.5 7.5" />
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 7.5-7.5 7.5 7.5" />
        </svg>

    </button>;
}

function FadeToInput() {
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

    return <input
        type="text"
        className="rounded bg-gray-900/70 p-1 w-16"
        placeholder="Volume"
        onKeyDown={e => {
            fadeInputHandler(e, {
                framePlayer,
                localVolumeControl: { localVolume, setLocalVolume },
                savedVolumeControl: { savedVolume, setSavedVolume },
                fadeAnimationControl: { fadeAnimationHandle, setFadeAnimationHandle },
                durationMs: fadeDurationMs,
            });
        }}
        disabled={!framePlayer}
    />;
}

function FadeOutButton() {
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

    return <button
        className="rounded bg-gray-900/70 p-1 disabled:opacity-50 w-min"
        onClick={() => {
            fadeOut({
                framePlayer,
                localVolumeControl: { localVolume, setLocalVolume },
                savedVolumeControl: { savedVolume, setSavedVolume },
                fadeAnimationControl: { fadeAnimationHandle, setFadeAnimationHandle },
                durationMs: fadeDurationMs,
                pLimit: 0,
            });
        }}
        disabled={!framePlayer}
    >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"
             className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 5.25 7.5 7.5 7.5-7.5m-15 6 7.5 7.5 7.5-7.5" />
        </svg>

    </button>;
}
