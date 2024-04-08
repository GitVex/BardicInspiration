export const DEFAULT_VOLUME = 50;

// 'video placeholder' by Tristan Behaut or One Final Effort by Martin O'Donnell and Michael Salvatori
export const DEFAULT_VIDEOID = process.env.NODE_ENV !== 'development' ? 'NpEaa2P7qZI' : 'P2NVJSJVGVQ'; 

export const DEFAULT_FADE_INTERVAL = 75;

export const DEFAULT_FADE_STEP = 1;

export const DEFAULT_EASE = (x: number, limit: number) => limit * (1 - Math.cos(((x / limit) * Math.PI) / 2));