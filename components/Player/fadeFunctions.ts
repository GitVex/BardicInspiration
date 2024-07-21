import IFPlayer from './types/IFPlayer';
import { DEFAULT_EASE, DEFAULT_FADE_INTERVAL, DEFAULT_FADE_STEP } from '../utils/DEFAULTS';
import { fadeIntervalControlEndType, localVolumeControlEndType } from './types/states';

export interface FadeOptions {
    framePlayer: IFPlayer | null;
    localVolumeControl: localVolumeControlEndType;
    fadeIntervalControl: fadeIntervalControlEndType;
    pLimit?: number;
    inverse?: boolean;
    savedVolumeControl?: {
        savedVolume: { hasSaved: boolean; prevVol: number };
        setSavedVolume: (savedVolume: { hasSaved: boolean; prevVol: number }) => void;
    };
}

function fade({
                  framePlayer,
                  localVolumeControl,
                  fadeIntervalControl,
                  pLimit,
                  inverse = false,
                  savedVolumeControl,
              }: FadeOptions) {
    if (!framePlayer) return;

    const { localVolume: volume, setLocalVolume: setVolume } = localVolumeControl;
    const { currentFadeInterval, setCurrentFadeInterval } = fadeIntervalControl;
    const { savedVolume, setSavedVolume } = savedVolumeControl ?? {};

    // Clear any existing interval
    if (currentFadeInterval) {
        clearInterval(currentFadeInterval);
        setCurrentFadeInterval(null);
    }

    // Define the limit for volume change
    let limit = savedVolume?.hasSaved ? savedVolume.prevVol : pLimit ?? (volume === 0 ? 50 : volume);
    console.log('Fading', inverse ? 'out' : 'in', inverse ? 'from' : 'to', limit);

    // Initialize starting based on fading direction
    const startVolume = inverse ? volume : 1;

    // Play video if not fading out
    if (!inverse) {
        framePlayer.playVideo();
    }

    const x = { hasSaved: true, prevVol: startVolume };
    // Save the current volume if fading out
    if (inverse) {
        console.log(setSavedVolume);
        setSavedVolume?.(x);
        console.log('saving Volume:', x);
    }

    function endFade(finalVolume: number) {
        setVolume(finalVolume);
        if (finalVolume === 0) framePlayer?.pauseVideo();
        clearInterval(intervalId);
        setCurrentFadeInterval(null);
    }

    let runner = startVolume;

    function step() {
        // Calculate next volume based on direction
        let nextVolume = inverse
            ? Math.floor(DEFAULT_EASE(runner, startVolume))
            : Math.floor(DEFAULT_EASE(runner, limit));

        // Update volume and adjust runner based on fade direction
        setVolume(nextVolume);
        runner += inverse ? -DEFAULT_FADE_STEP : DEFAULT_FADE_STEP;

        // Check if the runner has reached or passed its limit
        if ((inverse && runner <= 0) || (!inverse && runner >= limit)) {
            endFade(inverse ? 0 : limit);
        }
    }

    const intervalId = setInterval(step, DEFAULT_FADE_INTERVAL);
    setCurrentFadeInterval(intervalId);
}

export function fadeIn(options: FadeOptions) {
    fade({ ...options });
}

export function fadeOut(options: FadeOptions) {
    fade({ ...options, inverse: true });
}

export function fadeTo({ framePlayer, localVolumeControl, fadeIntervalControl, pLimit = 50 }: FadeOptions) {
    if (!framePlayer) return;

    const { localVolume: volume, setLocalVolume: setVolume } = localVolumeControl;
    const { currentFadeInterval, setCurrentFadeInterval } = fadeIntervalControl;

    // Clear any existing interval
    if (currentFadeInterval) {
        clearInterval(currentFadeInterval);
        setCurrentFadeInterval(null);
    }

    let currentVolume = volume;

    let intervalId = setInterval(() => {
        try {
            if (currentVolume > pLimit) {
                currentVolume -= DEFAULT_FADE_STEP;
                setVolume(currentVolume);
            } else if (currentVolume < pLimit) {
                currentVolume += DEFAULT_FADE_STEP;
                setVolume(currentVolume);
            } else {
                endFade(pLimit);
            }
        } catch (error) {
            clearInterval(intervalId);
        }
    }, DEFAULT_FADE_INTERVAL);

    setCurrentFadeInterval(intervalId);

    function endFade(volume: number) {
        setVolume(volume);
        clearInterval(intervalId);
        setCurrentFadeInterval(null);
    }
}

/* TO BE IMPLEMTNED: Crossfade two framePlayers */
