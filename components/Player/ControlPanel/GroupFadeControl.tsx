import { usePlayerHolder } from '../../Contexts/PlayerHolderProvider';
import IFPlayer from '../types/IFPlayer';
import { fadeIn, fadeOut } from '../fadeFunctions';
import { usePlayerControls } from '../Contexts/PlayerControlsProvider';
import ControlPanelButton from './utils/ControlPanelButton';

function useHandleGroupFade(direction: 'in' | 'out', framedPlayers: (IFPlayer | null)[]) {

    // collect all attributes from context
    const {
        presetState,
        presetDispatch,
        localVolumes,
        localVolumesDispatch,
        fadeIntervals,
        fadeIntervalDispatch,
    } = usePlayerControls();

    return () => {

        // Early exit if any framedPlayers are null
        if (framedPlayers.some(framePlayer => framePlayer === null)) return;

        // Determine the fade action based on the direction
        const fadeAction = direction === 'in' ? fadeIn : fadeOut;

        presetState.players.forEach((player, idx) => {
            if (!player.selected || !framedPlayers[idx]) return;

            const targetVolume = direction === 'in' ? localVolumes.volume[idx] : 0;
            const setVolume = (vol: number) => {
                localVolumesDispatch({ type: 'setVolume', index: idx, payload: vol });
            };
            const setCurrentFadeInterval = (interval: NodeJS.Timeout | null) => {
                fadeIntervalDispatch({
                    type: 'setCurrentFadeInterval',
                    index: idx,
                    payload: interval,
                });
            };
            const setSavedVolume = (savedVolume: { hasSaved: boolean; prevVol: number }) => {
                presetDispatch({
                    type: 'setSavedVolume',
                    index: idx,
                    payload: savedVolume,
                });
            };

            fadeAction({
                framePlayer: framedPlayers[idx],
                localVolumeControl: { localVolume: localVolumes.volume[idx], setLocalVolume: setVolume },
                fadeIntervalControl: {
                    currentFadeInterval: fadeIntervals.fadeIntervals[idx],
                    setCurrentFadeInterval,
                },
                savedVolumeControl: { savedVolume: player.savedVolume, setSavedVolume },
                pLimit: targetVolume,
                inverse: direction === 'out',
            });
        });
    };
}


function GroupFadeControl({ initialLoadDone }: { initialLoadDone: boolean }) {
    const { holders } = usePlayerHolder();
    const disable = !initialLoadDone;
    const framedPlayers = holders.map(holder => holder.player);

    const handleGroupFadeIn = useHandleGroupFade('in', framedPlayers);
    const handleGroupFadeOut = useHandleGroupFade('out', framedPlayers);

    return (
        <div>
            <div className="flex flex-row gap-2 rounded border-2 border-darknavy-700 bg-darknavy-500 p-2">
                <ControlPanelButton onClick={() => handleGroupFadeIn} disabled={disable}>
                    Fade In
                </ControlPanelButton>

                <ControlPanelButton onClick={() => handleGroupFadeOut()} disabled={disable}>
                    Fade Out
                </ControlPanelButton>
            </div>
        </div>
    );
}

export default GroupFadeControl;
