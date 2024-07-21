import { usePlayerHolder, usePresetState } from '../../Contexts/PlayerHolderProvider';
import { argMin, loadNewVideo } from '../../utils/utils';

export const useLoadVideoInLongestPausedPlayer = () => {
    const { holders: playerHolder } = usePlayerHolder();
    const { presetState, presetDispatch } = usePresetState();

    return (url: string) => {
        // Check if players array is empty
        if (!presetState.players || presetState.players.length === 0) {
            console.error('No players available.');
            return;
        }

        // Find the index of the longest paused player
        const longestPausedIndex = argMin(presetState.players.map(player => player.pausedAt));

        // Check if argMin returned a valid index
        if (longestPausedIndex < 0 || longestPausedIndex >= presetState.players.length) {
            console.error('Invalid index returned by argMin.');
            return;
        }

        // Retrieve the player using the index
        const holder = playerHolder[longestPausedIndex];

        if (holder && holder.player) {
            // Load the video into the player
            loadNewVideo(longestPausedIndex, presetDispatch, holder.player, url, holder.player.getVolume());
        } else {
            console.error('Player not found for the given index.');
        }
    };
};
