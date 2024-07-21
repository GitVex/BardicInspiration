import { motion } from 'framer-motion';
import VolumeSlider from './VolumeSlider';
import { fadeIn, fadeOut } from './fadeFunctions';
import { fadeInputHandler, loadNewVideo } from '../utils/utils';
import { usePlayerLocalControls } from './Contexts/PlayerLocalControlsProvider';
import { usePlayerControls } from './Contexts/PlayerControlsProvider';

function PlayerComponent() {
    const {
        selected,
        setSelected,
        playerId,
        localVolume,
        setLocalVolume,
    } = usePlayerLocalControls();
    const ID = `player${playerId}`;

    return (
        <motion.div
            className="flex flex-row h-full w-full gap-2 rounded border-2 border-darknavy-700 bg-darknavy-500 p-1"
            animate={{
                boxShadow: selected ? '0 0 8px 1px #f00' : '0 0 0 0px #fff',
            }}
            transition={{
                duration: 0.2,
            }}
            onClick={e => {
                if (e.currentTarget !== e.target) return;
                setSelected();
            }}
        >
            <div className="flex flex-col h-full w-1/2 gap-1" onClick={e => e.stopPropagation()}>
                <div className="rounded" id={ID} />
                <LoadVideoInput />
            </div>
            <div className="flex flex-row gap-2 w-1/2 h-full"
                 onClick={e => e.stopPropagation()}>
                <div className="flex flex-col gap-2 h-full w-2/3">
                    <FadeInButton />
                    <FadeToInput />
                    <FadeOutButton />
                </div>
                <VolumeSlider
                    volumeControl={{
                        localVolume,
                        setLocalVolume,
                    }}
                    height={'90%'}
                    opaque={true}
                />
            </div>
        </motion.div>
    );
}

export default PlayerComponent;

function LoadVideoInput() {
    const { playerId, framePlayer, localVolume } = usePlayerLocalControls();
    const { debouncedPresetDispatch, masterVolumeModifier } = usePlayerControls();

    const handleKeyDown = (e: any) => {
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
        currentFadeInterval,
        setCurrentFadeInterval,
    } = usePlayerLocalControls();

    return <button
        className="rounded bg-gray-800/50 p-1 disabled:opacity-50"
        onClick={() => {
            fadeIn({
                framePlayer,
                localVolumeControl: { localVolume, setLocalVolume },
                savedVolumeControl: { savedVolume, setSavedVolume },
                fadeIntervalControl: { currentFadeInterval, setCurrentFadeInterval },
            });
        }}
        disabled={!framePlayer}
    >
        Fade In
    </button>;
}

function FadeToInput() {
    const {
        framePlayer,
        localVolume,
        setLocalVolume,
        savedVolume,
        setSavedVolume,
        currentFadeInterval,
        setCurrentFadeInterval,
    } = usePlayerLocalControls();

    return <input
        type="text"
        className="rounded bg-gray-800/50 p-1"
        placeholder="Volume"
        onKeyDown={e => {
            fadeInputHandler(e, {
                framePlayer,
                localVolumeControl: { localVolume, setLocalVolume },
                savedVolumeControl: { savedVolume, setSavedVolume },
                fadeIntervalControl: { currentFadeInterval, setCurrentFadeInterval },
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
        currentFadeInterval,
        setCurrentFadeInterval,
    } = usePlayerLocalControls();

    return <button
        className="rounded bg-gray-800/50 p-1 disabled:opacity-50"
        onClick={() => {
            fadeOut({
                framePlayer,
                localVolumeControl: { localVolume, setLocalVolume },
                savedVolumeControl: { savedVolume, setSavedVolume },
                fadeIntervalControl: { currentFadeInterval, setCurrentFadeInterval },
                pLimit: 0,
            });
        }}
        disabled={!framePlayer}
    >
        Fade Out
    </button>;
}
