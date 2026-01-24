import { AnimatePresence, motion } from 'framer-motion';
import VolumeSlider from './VolumeSlider';
import { fadeIn, fadeInputHandler, fadeOut } from './fadeFunctions';
import { loadNewVideo } from '../utils/utils';
import { usePlayerControls } from './Contexts/PlayerControlsProvider';
import { useStackControls } from '../Contexts/StackControlsProvider';
import React, { useState } from 'react';

function PlayerComponent() {
    const { selected, setSelected, playerId, localVolume, setLocalVolume } = usePlayerControls();
    const [showSettings, setShowSettings] = useState(false); // Toggle for Video ID
    const ID = `player${playerId}`;

    return (
        <motion.div
            // Use 'group' to handle hover effects
            className="group relative flex flex-row h-full overflow-hidden rounded-xl border border-white/10 bg-gray-900 shadow-xl"
            animate={{
                // Subtle glow instead of harsh red border
                borderColor: selected ? 'rgba(239, 68, 68, 0.8)' : 'rgba(255, 255, 255, 0.1)',
                boxShadow: selected ? '0 0 15px rgba(239, 68, 68, 0.2)' : 'none',
            }}
            onClick={(e) => {
                if (e.currentTarget === e.target) setSelected();
            }}
        >
            <button
                onClick={() => setShowSettings(!showSettings)}
                className="absolute top-1 right-1 z-20 rounded-full bg-black/50 p-1.5 text-xs text-white hover:bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"
            >
                {showSettings ?
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                         stroke="currentColor" className="size-4">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                    :
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                         stroke="currentColor" className="size-4">
                        <path stroke-linecap="round" stroke-linejoin="round"
                              d="m19.5 4.5-15 15m0 0h11.25m-11.25 0V8.25" />
                    </svg>
                }
            </button>

            {/* Left Side: Video & Status */}
            <div className="relative w-1/2 h-full bg-black">
                <div className="h-full w-full opacity-80" id={ID} />

                <AnimatePresence>
                    {showSettings && (
                        <motion.div
                            key={`player${playerId}-input`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute inset-0 z-10 flex flex-col justify-center bg-black/90 p-2"
                        >
                            <label className="text-xs text-gray-400 mb-1">Load Video ID</label>
                            <LoadVideoInput />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Right Side: Mixing Controls */}
            <div className="flex w-1/2 flex-row p-2 gap-2 bg-gray-800/50">
                <div className="h-full w-1/2 flex flex-col items-center justify-center py-2">
                    <VolumeSlider
                        volumeControl={{ localVolume, setLocalVolume }}
                        height={'100%'}
                        opaque={false}
                    />
                </div>

                <div className="flex flex-col justify-center items-center gap-1">
                    <FadeInButton />
                    <FadeToInput />
                    <FadeOutButton />
                </div>
            </div>
        </motion.div>
    );
}

export default PlayerComponent;

function LoadVideoInput() {
    const { playerId, framePlayer, localVolume } = usePlayerControls();
    const { debouncedPresetDispatch, masterVolumeModifier } = useStackControls();

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
        className="rounded bg-gray-800/50 p-1"
        placeholder="Video ID"
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
    } = usePlayerControls();

    return <button
        className="rounded bg-gray-800/50 p-1 disabled:opacity-50 w-min"
        onClick={() => {
            fadeIn({
                framePlayer,
                localVolumeControl: { localVolume, setLocalVolume },
                savedVolumeControl: { savedVolume, setSavedVolume },
                fadeAnimationControl: { fadeAnimationHandle, setFadeAnimationHandle },
            });
        }}
        disabled={!framePlayer}
    >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
             className="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 18.75 7.5-7.5 7.5 7.5" />
            <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 7.5-7.5 7.5 7.5" />
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
    } = usePlayerControls();

    return <input
        type="text"
        className="rounded bg-gray-800/50 p-1 w-16"
        placeholder="Volume"
        onKeyDown={e => {
            fadeInputHandler(e, {
                framePlayer,
                localVolumeControl: { localVolume, setLocalVolume },
                savedVolumeControl: { savedVolume, setSavedVolume },
                fadeAnimationControl: { fadeAnimationHandle, setFadeAnimationHandle },
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
    } = usePlayerControls();

    return <button
        className="rounded bg-gray-800/50 p-1 disabled:opacity-50 w-min"
        onClick={() => {
            fadeOut({
                framePlayer,
                localVolumeControl: { localVolume, setLocalVolume },
                savedVolumeControl: { savedVolume, setSavedVolume },
                fadeAnimationControl: { fadeAnimationHandle, setFadeAnimationHandle },
                pLimit: 0,
            });
        }}
        disabled={!framePlayer}
    >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
             className="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 5.25 7.5 7.5 7.5-7.5m-15 6 7.5 7.5 7.5-7.5" />
        </svg>

    </button>;
}
