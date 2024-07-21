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
            className="flex flex-col w-full h-full justify-around gap-2 rounded border-2 border-darknavy-700 bg-darknavy-500 p-1"
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
            <div className="flex w-full h-4/5 flex-row justify-around" onClick={e => e.stopPropagation()}>
                <div className="rounded" id={ID} />
                <VolumeSlider
                    volumeControl={{
                        localVolume,
                        setLocalVolume,
                    }}
                    height={'90%'}
                    opaque={true}
                />
            </div>
            <div className="flex h-1/5 w-full flex-row items-center justify-center gap-2"
                 onClick={e => e.stopPropagation()}>
                <LoadVideoInput />
                <FadeInButton />
                <FadeToInput />
                <FadeOutButton />
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
        className="w-2/5 rounded bg-gray-800/50 p-1"
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
        className="w-1/5 rounded bg-gray-800/50 p-1 disabled:opacity-50"
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
        className=" w-1/5 rounded bg-gray-800/50 p-1"
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
        className="w-2/6 rounded bg-gray-800/50 p-1 disabled:opacity-50"
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
