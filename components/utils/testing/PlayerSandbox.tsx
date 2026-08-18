import React, { useState } from 'react';
import PresetProvider from '../../Player/Contexts/PresetProvider';
import PlayerHolderProvider, { usePlayerHolder } from '../../Contexts/PlayerHolderProvider';
import { StackControlsProvider } from '../../Contexts/StackControlsProvider';
import { PlayerControlsProvider } from '../../Player/Contexts/PlayerControlsProvider';
import PlayerComponent from '../../Player/PlayerComponent';

const MIN_PLAYERS = 1;
const MAX_PLAYERS = 24;

// An arbitrary number of real YouTube players on the /test route, running the same provider stack
// the app uses. Deliberately without ControlPanel/InitialPlayerLoader: each player loads
// DEFAULT_VIDEO_ID at construction, and the settings toggle on the card loads any other id.
function PlayerSandbox() {
    const [playerCount, setPlayerCount] = useState(2);

    const setClamped = (n: number) => setPlayerCount(Math.min(MAX_PLAYERS, Math.max(MIN_PLAYERS, n)));

    return (
        <div className="flex h-full w-full flex-col gap-3 p-4">
            <CountControls count={playerCount} onChange={setClamped} />

            {/* The providers read playerCount once on mount, so keying the stack on it remounts
                them - which also exercises the players' destroy-and-rebuild path on every change */}
            <PresetProvider key={playerCount} playerCount={playerCount}>
                <PlayerHolderProvider playerCount={playerCount}>
                    <StackControlsProvider playerCount={playerCount}>
                        <BuildStatus />
                        <PlayerGrid playerCount={playerCount} />
                    </StackControlsProvider>
                </PlayerHolderProvider>
            </PresetProvider>
        </div>
    );
}

export default PlayerSandbox;

// auto-fill + minmax lets the column count follow the available width. The column max matters as
// much as the min: an unbounded 1fr column makes a single card so wide that the 16:9 video can no
// longer fill its half, and the slot clamps to the card height instead of keeping its ratio.
function PlayerGrid({ playerCount }: { playerCount: number }) {
    return (
        <div
            className="grid min-h-0 justify-start gap-2 overflow-y-auto"
            style={{
                gridTemplateColumns: 'repeat(auto-fill, minmax(22rem, 24rem))',
                gridAutoRows: '10rem',
            }}
        >
            {Array.from({ length: playerCount }, (_, id) => id).map(id => (
                <PlayerControlsProvider playerId={id} key={id}>
                    <PlayerComponent />
                </PlayerControlsProvider>
            ))}
        </div>
    );
}

function CountControls({ count, onChange }: { count: number; onChange: (n: number) => void }) {
    return (
        <div className="flex shrink-0 flex-row items-center gap-2">
            <button className="button-primary" onClick={() => onChange(count - 1)} disabled={count <= MIN_PLAYERS}>
                −
            </button>
            <input
                type="number"
                className="w-16 rounded bg-gray-800/50 p-1 text-center"
                value={count}
                min={MIN_PLAYERS}
                max={MAX_PLAYERS}
                onChange={e => {
                    const parsed = parseInt(e.target.value, 10);
                    if (!Number.isNaN(parsed)) onChange(parsed);
                }}
            />
            <button className="button-primary" onClick={() => onChange(count + 1)} disabled={count >= MAX_PLAYERS}>
                +
            </button>
        </div>
    );
}

function BuildStatus() {
    const { holders, firstLoadDone } = usePlayerHolder();

    return (
        <p className="shrink-0 text-xs text-gray-400">
            {holders.filter(h => h.player).length}/{holders.length} built,{' '}
            {holders.filter(h => h.isReady).length} ready{firstLoadDone ? '' : ' — building…'}
        </p>
    );
}
