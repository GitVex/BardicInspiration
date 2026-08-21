import React from 'react';
import { useStackActions, useStackState } from '../../Contexts/StackControlsProvider';
import { usePlayerHolder } from '../../Contexts/PlayerHolderProvider';
import { useTrackByVideoId } from '../hooks/useTrackByVideoId';
import { useVideoTitle } from '../hooks/useVideoTitle';

/**
 * The list the group actions act on.
 *
 * This used to be eight unlabelled boxes mirroring the player grid's 2x4 geometry, which meant
 * reading it required counting positions against the grid beside it. Naming each row makes it a
 * mixer strip list instead of a mini-map, and puts the group actions next to what they operate on.
 */
function SelectionsViewer() {
    const { presetState } = useStackState();
    const { selectAll, selectNone, invertSelection } = useStackActions();

    const players = presetState.players;
    const selectedCount = players.filter(player => player.selected).length;

    return (
        <div className="flex w-full min-h-0 flex-col gap-1">
            <div className="flex flex-row items-baseline justify-between px-0.5">
                <span className="text-sm font-semibold">Players</span>
                <span className="text-xs text-gray-400">{selectedCount} selected</span>
            </div>

            <div className="flex min-h-0 flex-col gap-1 overflow-y-auto">
                {players.map((player, index) => (
                    <SelectionRow key={index} index={index} selected={player.selected} videoId={player.videoId} />
                ))}
            </div>

            <div className="flex flex-row gap-1">
                <SelectionActionButton onClick={selectAll} disabled={selectedCount === players.length}>
                    All
                </SelectionActionButton>
                <SelectionActionButton onClick={selectNone} disabled={selectedCount === 0}>
                    None
                </SelectionActionButton>
                <SelectionActionButton onClick={invertSelection}>Invert</SelectionActionButton>
            </div>
        </div>
    );
}

export default SelectionsViewer;

function SelectionActionButton(
    { onClick, disabled = false, children }: { onClick: () => void; disabled?: boolean; children: React.ReactNode },
) {
    return (
        <button
            className="flex-1 rounded border border-darknavy-700 bg-darknavy-500 px-1 py-0.5 text-xs
                       hover:bg-darknavy-400/40 disabled:opacity-40 transition-colors"
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
}

function SelectionRow({ index, selected, videoId }: { index: number; selected: boolean; videoId: string }) {
    const { toggleSelected } = useStackActions();
    const { focusedPlayerId } = useStackState();
    const { holders } = usePlayerHolder();

    const { track } = useTrackByVideoId(videoId);
    const title = useVideoTitle(holders[index]?.player ?? null, videoId, track?.title);

    return (
        <button
            className={`flex w-full flex-row items-center gap-2 rounded border px-1.5 py-1 text-left
                        transition-colors ${focusedPlayerId === index
                ? 'border-yellow-400/80 bg-yellow-400/10'
                : selected
                    ? 'border-red-500/70 bg-red-900/20'
                    : 'border-darknavy-700 bg-darknavy-500 hover:bg-darknavy-400/30'}`}
            onClick={() => toggleSelected(index)}
            title={title}
        >
            {/* The track's own colour, so a row is findable by the same tint as its card */}
            <span
                className="h-3 w-1 shrink-0 rounded-full"
                style={{ backgroundColor: track?.color ?? 'transparent' }}
            />
            <span className="w-3 shrink-0 text-xs text-gray-400">{index + 1}</span>
            <span className="min-w-0 flex-1 truncate text-xs">{title}</span>
        </button>
    );
}
