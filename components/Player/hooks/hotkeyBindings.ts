import { StackActions, StackState } from '../../Contexts/StackControlsProvider';

export type HotkeyScope = 'global' | 'open' | 'selection' | 'focused';

/** Actions only the card itself can carry out, since they touch its own player and fields. */
export type CardAction = 'flip' | 'focusFadeTo' | 'loadClipboard';

export interface HotkeyContext {
    state: StackState;
    actions: StackActions;
    selectedIds: number[];
    focusedId: number | null;
    setOpenPlayer: (open: boolean | ((open: boolean) => boolean)) => void;
    setShowHelp: (show: boolean | ((show: boolean) => boolean)) => void;
    /** Fades the selection together, synced, the same way the control panel's buttons do. */
    groupFade: (direction: 'in' | 'out') => void;
    /** Asks the focused card to run a local action - turning over, focusing its fade field. */
    emitCardAction: (playerId: number, action: CardAction) => void;
}

export interface HotkeyBinding {
    id: string;
    /** Matched against a normalised "shift+arrowup" style descriptor. */
    keys: string[];
    scope: HotkeyScope;
    /** How the key reads in the help overlay. */
    display: string;
    label: string;
    group: 'Global' | 'Selection' | 'Selected players' | 'Focused player';
    run: (ctx: HotkeyContext) => void;
}

const digits = [1, 2, 3, 4, 5, 6, 7, 8];

export const HOTKEY_BINDINGS: HotkeyBinding[] = [
    // ------- GLOBAL -------
    {
        id: 'toggle-player',
        keys: ['space'],
        scope: 'global',
        display: 'Space',
        label: 'Open or close the player',
        group: 'Global',
        run: ctx => ctx.setOpenPlayer(open => !open),
    },
    {
        id: 'close-player',
        keys: ['escape'],
        scope: 'global',
        display: 'Esc',
        label: 'Close the player',
        group: 'Global',
        run: ctx => ctx.setShowHelp(showHelp => {
            // Escape closes the help first, and only then the overlay behind it
            if (showHelp) return false;
            ctx.setOpenPlayer(false);
            return false;
        }),
    },
    {
        id: 'help',
        keys: ['?'],
        scope: 'global',
        display: '?',
        label: 'Show this list',
        group: 'Global',
        run: ctx => ctx.setShowHelp(show => !show),
    },

    // ------- SELECTION -------
    ...digits.map<HotkeyBinding>(digit => ({
        id: `select-${digit}`,
        keys: [`digit${digit}`],
        scope: 'open',
        display: digit === 1 ? '1 – 8' : '',
        label: digit === 1 ? 'Select only that player' : '',
        group: 'Selection',
        run: ctx => ctx.actions.selectOnly(digit - 1),
    })),
    ...digits.map<HotkeyBinding>(digit => ({
        id: `add-${digit}`,
        keys: [`shift+digit${digit}`],
        scope: 'open',
        display: digit === 1 ? 'Shift + 1 – 8' : '',
        label: digit === 1 ? 'Add or remove that player' : '',
        group: 'Selection',
        run: ctx => ctx.actions.toggleSelected(digit - 1),
    })),
    {
        id: 'select-all',
        keys: ['a'],
        scope: 'open',
        display: 'A',
        label: 'Select all',
        group: 'Selection',
        run: ctx => ctx.actions.selectAll(),
    },
    {
        id: 'select-none',
        keys: ['n'],
        scope: 'open',
        display: 'N',
        label: 'Select none',
        group: 'Selection',
        run: ctx => ctx.actions.selectNone(),
    },
    {
        id: 'invert',
        keys: ['i'],
        scope: 'open',
        display: 'I',
        label: 'Invert the selection',
        group: 'Selection',
        run: ctx => ctx.actions.invertSelection(),
    },
    {
        id: 'select-playing',
        keys: ['p'],
        scope: 'open',
        display: 'P',
        label: 'Select all playing',
        group: 'Selection',
        run: ctx => ctx.actions.selectByPlayState(true),
    },
    {
        id: 'select-paused',
        keys: ['u'],
        scope: 'open',
        display: 'U',
        label: 'Select all paused',
        group: 'Selection',
        run: ctx => ctx.actions.selectByPlayState(false),
    },

    // ------- SELECTED PLAYERS -------
    {
        id: 'mute-selection',
        keys: ['m'],
        scope: 'selection',
        display: 'M',
        label: 'Mute or unmute',
        group: 'Selected players',
        run: ctx => ctx.selectedIds.forEach(id => ctx.actions.toggleMute(id)),
    },
    {
        id: 'solo-selection',
        keys: ['s'],
        scope: 'selection',
        display: 'S',
        label: 'Silence everything playing outside the selection',
        group: 'Selected players',
        run: ctx => ctx.actions.toggleSolo(ctx.selectedIds),
    },
    {
        id: 'fade-in',
        keys: ['arrowup'],
        scope: 'selection',
        display: '↑ ↓',
        label: 'Fade the selection in or out, synced',
        group: 'Selected players',
        run: ctx => ctx.groupFade('in'),
    },
    {
        id: 'fade-out',
        keys: ['arrowdown'],
        scope: 'selection',
        display: '',
        label: '',
        group: 'Selected players',
        run: ctx => ctx.groupFade('out'),
    },
    {
        id: 'master-up',
        keys: ['shift+arrowup'],
        scope: 'global',
        display: 'Shift + ↑ ↓',
        label: 'Master volume',
        group: 'Selected players',
        run: ctx => ctx.actions.setMasterVolume(volume => Math.min(100, volume + 5)),
    },
    {
        id: 'master-down',
        keys: ['shift+arrowdown'],
        scope: 'global',
        display: '',
        label: '',
        group: 'Selected players',
        run: ctx => ctx.actions.setMasterVolume(volume => Math.max(0, volume - 5)),
    },

    // ------- FOCUSED PLAYER -------
    {
        id: 'flip-card',
        keys: [','],
        scope: 'focused',
        display: ',',
        label: 'Turn the card over',
        group: 'Focused player',
        run: ctx => ctx.focusedId !== null && ctx.emitCardAction(ctx.focusedId, 'flip'),
    },
    {
        id: 'focus-fade-to',
        keys: ['t'],
        scope: 'focused',
        display: 'T',
        label: 'Focus the fade-to field',
        group: 'Focused player',
        run: ctx => ctx.focusedId !== null && ctx.emitCardAction(ctx.focusedId, 'focusFadeTo'),
    },
    {
        id: 'load-clipboard',
        keys: ['l'],
        scope: 'focused',
        display: 'L',
        label: 'Load the video on the clipboard',
        group: 'Focused player',
        run: ctx => ctx.focusedId !== null && ctx.emitCardAction(ctx.focusedId, 'loadClipboard'),
    },
];

/**
 * Builds the descriptor a binding's `keys` are matched against.
 *
 * Letters and punctuation come from `key`, which is layout-independent for a-z; digits come from
 * `code`, so the number row stays distinguishable from the numpad. Shift is only part of the
 * descriptor for keys where it is not already needed to type the character.
 */
export function describeEvent(event: KeyboardEvent): string {
    const isDigit = /^Digit[1-8]$/.test(event.code);
    const base = isDigit
        ? event.code.toLowerCase()
        : event.key === ' ' ? 'space' : event.key.toLowerCase();

    const shifted = event.shiftKey && (isDigit || event.key.startsWith('Arrow'));

    return shifted ? `shift+${base}` : base;
}
