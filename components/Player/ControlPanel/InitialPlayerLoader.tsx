import { useEffect, useRef } from 'react';
import { usePlayerHolder } from '../../Contexts/PlayerHolderProvider';
import { loadNewVideo } from '../../utils/utils';
import { useStackState, useStackActions } from '../../Contexts/StackControlsProvider';

interface InitialPlayerLoaderProps {
    onLoaded: () => void;
}

/**
 * Pushes the preset into the players once, as soon as every player reports ready.
 *
 * Readiness is already dispatched per player by PlayerHolderProvider, so this reacts to `holders`
 * changing rather than polling it on an interval - the load now happens on the render that
 * completes the set instead of up to a second later.
 */
function InitialPlayerLoader({ onLoaded }: InitialPlayerLoaderProps) {
    const { presetState } = useStackState();
    const { presetDispatch, localVolumesDispatch } = useStackActions();
    const { holders } = usePlayerHolder();

    // The load must happen exactly once. A ref rather than state because the guard has to be
    // accurate within the same tick it is set, not a render later.
    const hasLoaded = useRef(false);

    useEffect(() => {
        if (hasLoaded.current) return;
        if (!holders.length || !holders.every(holder => holder.isReady)) return;

        hasLoaded.current = true;

        holders.forEach((holder, idx) => {
            if (!holder.player) return;

            localVolumesDispatch({
                type: 'setVolume',
                index: idx,
                payload: presetState.players[idx].volume,
            });

            loadNewVideo(idx, presetDispatch, holder.player, presetState.players[idx].videoId);
        });

        onLoaded();
    }, [holders, presetState.players, presetDispatch, localVolumesDispatch, onLoaded]);

    return null;
}

export default InitialPlayerLoader;
