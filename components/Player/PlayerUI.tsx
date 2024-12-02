import { useWindowSize } from '../Contexts/WindowSizeProvider';
import VolumeSlider from './VolumeSlider';
import ControlPanel from './ControlPanel/ControlPanel';
import PlayerComponent from './PlayerComponent';
import { PlayerControlsProvider } from './Contexts/PlayerControlsProvider';
import { useStackControls } from '../Contexts/StackControlsProvider';

function PlayerUI() {
    const { windowHeight, windowWidth } = useWindowSize();
    const { masterVolume, setMasterVolume } = useStackControls();

    return (
        <div
            className="absolute z-10 flex flex-row items-center justify-center gap-2 p-4 backdrop-blur-md"
            /* @ts-ignore */
            style={{ width: windowWidth, height: windowHeight }}
        >
            <div className="flex flex-row items-center gap-4">
                <div className="flex w-full flex-col items-center">
                    <div className="grid grid-cols-2 grid-rows-4 gap-2">
                        {[0, 1, 2, 3, 4, 5, 6, 7].map(id => (
                            <PlayerControlsProvider playerId={id} key={id}>
                                <PlayerComponent />
                            </PlayerControlsProvider>
                        ))}
                    </div>
                </div>
                <div
                    className="flex w-28 h-full flex-col items-center gap-4 rounded border-2 border-darknavy-700/50 bg-darknavy-500/50 p-1">
                    <p className="text-center">Master Volume</p>
                    <VolumeSlider
                        volumeControl={{
                            localVolume: masterVolume,
                            setLocalVolume: (vol: number) => setMasterVolume(vol),
                        }}
                        height={'500px'}
                    />
                </div>
            </div>

            <ControlPanel />
        </div>
    );
}

export default PlayerUI;
