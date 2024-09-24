export const DEFAULT_VOLUME = 50;

// 'video placeholder' by Tristan Behaut or One Final Effort by Martin O'Donnell and Michael Salvatori
export const DEFAULT_VIDEO_ID = process.env.NODE_ENV !== 'development' ? 'NpEaa2P7qZI' : 'P2NVJSJVGVQ';

export const DEFAULT_FADE_INTERVAL = 75;

export const DEFAULT_FADE_STEP = 1;

export const DEFAULT_EASE = (t: number): number => 1 - Math.cos((t * Math.PI) / 2);

export const GLOBAL_DISABLE_SAVE_PRESET = true;

export const DEFAULT_IS_OPEN_PLAYER_STATE = true; //process.env.NODE_ENV === 'development';

export const DEFAULT_FADE_DURATION = 5000