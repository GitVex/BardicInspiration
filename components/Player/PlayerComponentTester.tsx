import React from 'react';
import { motion } from 'framer-motion';
import VolumeSlider from './VolumeSlider';

// --- Design-only PlayerComponent ---
function PlayerComponentDesign() {
    // Static prop to demonstrate the selected state's box shadow animation
    const isSelected = true; // Toggle this to true/false to see the shadow effect
    const staticPlayerId = 'player1'; // Static ID for design

    const [volume, setVolume] = React.useState(0.75); // Static volume for design

    // Removed the dynamic dimensions state as grid handles sizing well.
    // You might re-introduce it if specific dynamic sizing based on viewport is still needed.

    return (
        <motion.div
            className="grid grid-rows-[4fr_1fr] h-min w-[25rem] rounded border-2 border-darknavy-700 bg-darknavy-500 p-1"
            animate={{
                boxShadow: isSelected ? '0 0 8px 1px #f00' : '0 0 0 0px #fff',
            }}
            transition={{
                duration: 0.2,
            }}
        >
            {/* Column 1: Video Player and Load Input */}
            <div className="grid grid-cols-[1fr_1fr] gap-1"> {/* Adjusted to make video player take available space */}
                <div
                    className={`flex rounded bg-black aspect-[16/9] w-[13rem] items-center justify-center text-gray-400`}
                    id={staticPlayerId}
                >
                    Video Player Area (ID: {staticPlayerId})
                </div>
                {/* Column 2: Controls and Volume Slider */}
                <div className="flex flex-row gap-2">
                    <div className="flex flex-col gap-2 h-min">
                        <FadeInButtonDesign />
                        <FadeToInputDesign />
                        <FadeOutButtonDesign />
                    </div>
                    <div className="">
                        <VolumeSlider
                            volumeControl={{ localVolume: volume, setLocalVolume: setVolume }}
                            opaque={false}
                            height={112}
                        />
                    </div>
                </div>
            </div>

            <div className="flex flex-row gap-2 h-min">
                <div className="w-40">
                    <LoadVideoInputDesign />
                </div>
                <div className="w-full bg-red-500 h-10" />
            </div>
        </motion.div>
    );
}

export default PlayerComponentDesign;

// --- Design-only LoadVideoInput ---
function LoadVideoInputDesign() {
    return (
        <input
            type="text"
            className="rounded bg-gray-800/50 p-1 text-white placeholder-gray-400 w-full h-min" // Added w-full for better fit
            placeholder="Video ID"
            defaultValue="dQw4w9WgXcQ"
        />
    );
}

// --- Design-only FadeInButton ---
function FadeInButtonDesign() {
    const isDisabled = false; // Toggle to true to see disabled state

    return (
        <button
            className={`rounded bg-gray-800/50 p-1 text-white w-full h-min ${ // Added w-full and h-full
                isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700/50'
            }`}
            disabled={isDisabled} // Reflects the visual state
        >
            Fade In
        </button>
    );
}

// --- Design-only FadeToInput ---
function FadeToInputDesign() {
    const isDisabled = false; // Toggle to true to see disabled state

    return (
        <input
            type="text"
            className={`rounded bg-gray-800/50 p-1 text-white placeholder-gray-400 w-full h-min ${ // Added w-full and h-full
                isDisabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            placeholder="Volume"
            readOnly // Non-interactive
            disabled={isDisabled} // Reflects the visual state
            defaultValue="75" // Example static value
        />
    );
}

// --- Design-only FadeOutButton ---
function FadeOutButtonDesign() {
    const isDisabled = true; // Example: Show button as disabled

    return (
        <button
            className={`rounded bg-gray-800/50 p-1 text-white w-full h-min ${ // Added w-full and h-full
                isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700/50'
            }`}
            disabled={isDisabled} // Reflects the visual state
        >
            Fade Out
        </button>
    );
}
