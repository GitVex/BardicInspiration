import { useCallback, useEffect, useState } from 'react';
import { usePlayerHolder } from '../../Contexts/PlayerHolderProvider';
import { loadNewVideo } from '../../utils/utils';
import { usePlayerControls } from '../Contexts/PlayerControlsProvider';

interface InitialPlayerLoaderProps {
    onLoaded: () => void;
}

function InitialPlayerLoader({ onLoaded }: InitialPlayerLoaderProps) {
    const {
        presetState,
        presetDispatch,
        localVolumesDispatch,
    } = usePlayerControls();

    const { holders: playerHolder } = usePlayerHolder();
    const [allPlayersReady, setAllPlayersReady] = useState(false);

    const allHoldersReady = useCallback(() => playerHolder.every(holder => holder.isReady), [playerHolder]);

    const checkAllPlayersReady = useCallback(() => {
        if (allHoldersReady() && !allPlayersReady) {
            setAllPlayersReady(true);
            playerHolder.forEach((holder, idx) => {
                if (holder.player) {
                    localVolumesDispatch({
                        type: 'setVolume',
                        index: idx,
                        payload: presetState.players[idx].volume,
                    });

                    loadNewVideo(idx, presetDispatch, holder.player, presetState.players[idx].videoId);
                }
            });

            setTimeout(() => onLoaded(), 100);
        }
    }, [
        allHoldersReady,
        allPlayersReady,
        playerHolder,
        presetDispatch,
        localVolumesDispatch,
        presetState.players,
        onLoaded,
    ]);

    useEffect(() => {
        const intervalId = setInterval(checkAllPlayersReady, 1000);

        return () => {
            clearInterval(intervalId);
        };
    }, [checkAllPlayersReady]);

    return null;
}

export default InitialPlayerLoader;
