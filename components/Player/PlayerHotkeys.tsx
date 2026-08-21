import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStackActions, useStackControls, useStackState } from '../Contexts/StackControlsProvider';
import { usePlayerHolder } from '../Contexts/PlayerHolderProvider';
import IFPlayer from './types/IFPlayer';
import { createGroupFadeHandler } from './ControlPanel/GroupFadeControl';
import { CardAction, describeEvent, HOTKEY_BINDINGS, HotkeyBinding, HotkeyContext } from './hooks/hotkeyBindings';

export const CARD_ACTION_EVENT = 'bardic:card-action';

export interface CardActionDetail {
    playerId: number;
    action: CardAction;
}

interface PlayerHotkeysProps {
    isOpenPlayer: boolean;
    setIsOpenPlayer: (open: boolean | ((open: boolean) => boolean)) => void;
}

/**
 * The single keydown listener for the player.
 *
 * Bindings live in hotkeyBindings as data, so the help overlay below renders from the same array
 * that dispatches and the two cannot drift apart.
 */
function PlayerHotkeys({ isOpenPlayer, setIsOpenPlayer }: PlayerHotkeysProps) {
    const state = useStackState();
    const actions = useStackActions();
    const controls = useStackControls();
    const { holders } = usePlayerHolder();
    const [showHelp, setShowHelp] = useState(false);

    const framedPlayers = useMemo(
        () => holders.map(holder => holder.player).filter((player): player is IFPlayer => player !== null),
        [holders],
    );

    const groupFade = useCallback(
        (direction: 'in' | 'out') => createGroupFadeHandler(direction, framedPlayers, controls)(),
        [framedPlayers, controls],
    );

    const emitCardAction = useCallback((playerId: number, action: CardAction) => {
        window.dispatchEvent(new CustomEvent<CardActionDetail>(CARD_ACTION_EVENT, {
            detail: { playerId, action },
        }));
    }, []);

    // The handler is registered once; everything it reads comes through this ref, so re-registering
    // on every volume tick is unnecessary.
    const ctxRef = useRef<HotkeyContext>();
    ctxRef.current = {
        state,
        actions,
        selectedIds: state.presetState.players.flatMap((player, id) => (player.selected ? [id] : [])),
        focusedId: state.focusedPlayerId,
        setOpenPlayer: setIsOpenPlayer,
        setShowHelp,
        groupFade,
        emitCardAction,
    };

    const isOpenRef = useRef(isOpenPlayer);
    isOpenRef.current = isOpenPlayer;

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            // Typing beats every binding. Checked with closest rather than an instanceof test
            // because the cards alone carry five fields, and "1" in any of them must stay a "1".
            const target = event.target as HTMLElement | null;
            if (target?.closest?.('input, textarea, select, [contenteditable]')) return;

            const ctx = ctxRef.current;
            if (!ctx) return;

            const descriptor = describeEvent(event);
            const binding = HOTKEY_BINDINGS.find(candidate => candidate.keys.includes(descriptor));
            if (!binding) return;

            if (!isAvailable(binding, ctx, isOpenRef.current)) return;
            // Repeats drive volume, but re-firing a toggle would just flicker it
            if (event.repeat && !binding.keys.some(key => key.includes('arrow'))) return;

            event.preventDefault();
            binding.run(ctx);
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);

    return <HotkeyHelp show={showHelp} onClose={() => setShowHelp(false)} />;
}

export default PlayerHotkeys;

function isAvailable(binding: HotkeyBinding, ctx: HotkeyContext, isOpen: boolean): boolean {
    switch (binding.scope) {
        case 'global':
            return true;
        case 'open':
            return isOpen;
        case 'selection':
            return isOpen && ctx.selectedIds.length > 0;
        case 'focused':
            return isOpen && ctx.focusedId !== null;
    }
}

function HotkeyHelp({ show, onClose }: { show: boolean; onClose: () => void }) {
    // Bindings with no display text are continuations of the row above - the eight digit keys, the
    // second arrow - so they are folded into it rather than listed again.
    const groups = useMemo(() => {
        const byGroup = new Map<string, HotkeyBinding[]>();
        HOTKEY_BINDINGS.filter(binding => binding.display).forEach(binding => {
            byGroup.set(binding.group, [...(byGroup.get(binding.group) ?? []), binding]);
        });
        return [...byGroup.entries()];
    }, []);

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        className="max-h-full w-full max-w-2xl overflow-y-auto rounded-xl border border-white/10
                                   bg-darknavy-600 p-6 shadow-2xl"
                        initial={{ scale: 0.97, y: 8 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.97, y: 8 }}
                        onClick={event => event.stopPropagation()}
                    >
                        <div className="mb-4 flex flex-row items-baseline justify-between">
                            <h2 className="text-lg font-semibold">Keyboard shortcuts</h2>
                            <span className="text-xs text-gray-400">Esc or ? to close</span>
                        </div>

                        <div className="flex flex-col gap-5">
                            {groups.map(([group, bindings]) => (
                                <div key={group} className="flex flex-col gap-1.5">
                                    <h3 className="text-xs uppercase tracking-wider text-gray-400">{group}</h3>
                                    {bindings.map(binding => (
                                        <div key={binding.id} className="flex flex-row items-baseline gap-3">
                                            <kbd className="shrink-0 rounded border border-white/20 bg-black/40 px-1.5
                                                            py-0.5 text-xs">
                                                {binding.display}
                                            </kbd>
                                            <span className="text-sm text-gray-200">{binding.label}</span>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>

                        <p className="mt-5 border-t border-white/10 pt-3 text-xs text-gray-400">
                            Clicking a video hands focus to the YouTube player, which swallows key presses.
                            Click anywhere outside it to get the shortcuts back.
                        </p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
