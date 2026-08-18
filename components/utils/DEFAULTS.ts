export const DEFAULT_VOLUME = 50;

// How many players the app runs with. The providers accept a playerCount prop that defaults to
// this; only the /test sandbox passes anything else.
export const DEFAULT_PLAYER_COUNT = 8;

// 'video placeholder' by Tristan Behaut or One Final Effort by Martin O'Donnell and Michael Salvatori
export const DEFAULT_VIDEO_ID = process.env.NODE_ENV !== 'development' ? 'NpEaa2P7qZI' : 'P2NVJSJVGVQ';

export const DEFAULT_EASE = (t: number): number => 1 - Math.cos((t * Math.PI) / 2);

export const GLOBAL_DISABLE_SAVE_PRESET = true;

export const DEFAULT_IS_OPEN_PLAYER_STATE = false;

export const DEFAULT_FADE_DURATION = (change: number) => 100 * Math.abs(change)