import VolumeSlider from './VolumeSlider';
import ControlPanel from './ControlPanel/ControlPanel';
import PlayerComponent from './PlayerComponent';
import { PlayerControlsProvider } from './Contexts/PlayerControlsProvider';
import { useStackControls } from '../Contexts/StackControlsProvider';
import { DEFAULT_PLAYER_COUNT } from '../utils/DEFAULTS';

// Sizing authority for the whole player: the parent overlay is fixed inset-0, so h-full here is
// a definite height. Every descendant sizes off that in percentages - no measured pixels, and
// nothing is content-sized. min-h-0/min-w-0 are what let the flex children actually shrink;
// without them flex items refuse to go below their content size and the layout overflows.
function PlayerUI() {
    const { masterVolume, setMasterVolume } = useStackControls();

    return (
        <div className="flex h-full w-full flex-row items-stretch justify-center gap-4 p-4 backdrop-blur-md">
            <div className="flex min-h-0 min-w-0 flex-1 flex-row items-stretch gap-4">
                <div className="grid min-h-0 min-w-0 flex-1 grid-cols-2 grid-rows-4 gap-2">
                    {Array.from({ length: DEFAULT_PLAYER_COUNT }, (_, id) => id).map(id => (
                        <PlayerControlsProvider playerId={id} key={id}>
                            <PlayerComponent />
                        </PlayerControlsProvider>
                    ))}
                </div>

                <div
                    className="flex w-28 shrink-0 flex-col items-center gap-4 rounded border-2 border-darknavy-700/50 bg-darknavy-500/50 p-1">
                    <p className="shrink-0 text-center">Master Volume</p>
                    {/* The slider's height: 100% needs a definite box to resolve against, which
                        is what flex-1 min-h-0 on this wrapper provides */}
                    <div className="flex min-h-0 flex-1 justify-center">
                        <VolumeSlider
                            volumeControl={{
                                localVolume: masterVolume,
                                setLocalVolume: (vol: number) => setMasterVolume(vol),
                            }}
                            height={'100%'}
                        />
                    </div>
                </div>
            </div>

            <ControlPanel />
        </div>
    );
}

export default PlayerUI;
