import IFPlayer from './types/IFPlayer';
import { DEFAULT_EASE, DEFAULT_FADE_DURATION } from '../utils/DEFAULTS';
import { FadeAnimationControlEndType, LocalVolumeControlEndType } from './types/states';
import React from 'react';

export interface FadeOptions {
    framePlayer: IFPlayer | null;
    localVolumeControl: LocalVolumeControlEndType;
    fadeAnimationControl: FadeAnimationControlEndType;
    pLimit?: number;
    inverse?: boolean;
    sync?: boolean;
    /** Per-player override for the volume-proportional default duration. */
    durationMs?: number | null;
    savedVolumeControl?: {
        savedVolume: { hasSaved: boolean; prevVol: number };
        setSavedVolume: (savedVolume: { hasSaved: boolean; prevVol: number }) => void;
    };
}

function fade({
                  framePlayer,
                  localVolumeControl,
                  fadeAnimationControl,
                  pLimit,
                  sync = false,
                  inverse = false,
                  durationMs,
                  savedVolumeControl,
              }: FadeOptions) {
    if (!framePlayer) return;

    const { localVolume: volume, setLocalVolume: setVolume } = localVolumeControl;
    const { fadeAnimationHandle, setFadeAnimationHandle } = fadeAnimationControl;
    const { savedVolume, setSavedVolume } = savedVolumeControl ?? {};

    // Clear any existing interval
    if (fadeAnimationHandle) {
        cancelAnimationFrame(fadeAnimationHandle);
        setFadeAnimationHandle(null);
    }

    // Determine the target volume (limit)
    let limit = 50; // Default limit
    if (pLimit !== undefined) {
        limit = pLimit;
    } else if (volume !== 0) {
        limit = volume;
    } else if (savedVolume?.hasSaved) {
        limit = savedVolume.prevVol;
    }

    // Define start and end volumes based on fade direction
    const startVolume = inverse ? volume : 0;
    const endVolume = inverse ? 0 : limit;

    console.debug('Breakpoint 1', startVolume);

    // Play video if not fading out
    if (!inverse) {
        framePlayer.playVideo();
    }

    // Save the current volume if fading out
    if (inverse && setSavedVolume) {
        setSavedVolume({ hasSaved: true, prevVol: startVolume });
    }

    function endFade(finalVolume: number) {
        setVolume(finalVolume);
        if (finalVolume === 0) framePlayer?.pauseVideo();
        cancelAnimationFrame(animFrameId);
        setFadeAnimationHandle(null);
    }

    let currentVolume = startVolume;
    const volumeChange = endVolume - startVolume;
    // A group fade stays locked to 4s so the players land together; otherwise the player's own
    // setting wins, falling back to the volume-proportional default.
    const duration = sync ? 4000 : durationMs ?? DEFAULT_FADE_DURATION(volumeChange);
    const startTime = performance.now();

    const easeFunc = inverse ? (t: number) => 1 - DEFAULT_EASE(1 - t) : DEFAULT_EASE;

    function step(currentTime: number) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeFunc(progress);

        currentVolume = startVolume + volumeChange * easedProgress;
        setVolume(Math.floor(currentVolume));

        if (progress < 1) {
            animFrameId = requestAnimationFrame(step);
        } else {
            endFade(endVolume);
        }
    }

    let animFrameId = requestAnimationFrame(step);
    setFadeAnimationHandle(animFrameId);
}

export function fadeIn(options: FadeOptions) {
    fade({ ...options });
}

export function fadeOut(options: FadeOptions) {
    fade({ ...options, inverse: true });
}

export function fadeTo({ framePlayer, localVolumeControl, fadeAnimationControl, pLimit = 50, durationMs }: FadeOptions) {
    if (!framePlayer) return;

    const { localVolume: volume, setLocalVolume: setVolume } = localVolumeControl;
    const { fadeAnimationHandle, setFadeAnimationHandle } = fadeAnimationControl;

    // Clear any existing animation frame
    if (fadeAnimationHandle !== null) {
        cancelAnimationFrame(fadeAnimationHandle);
        setFadeAnimationHandle(null);
    }

    const startVolume = volume;
    const endVolume = pLimit;
    const volumeChange = endVolume - startVolume;
    const duration = durationMs ?? DEFAULT_FADE_DURATION(volumeChange);
    const startTime = performance.now();

    console.log('Breakpoint 1', startVolume);

    function endFade(finalVolume: number) {
        setVolume(finalVolume);
        setFadeAnimationHandle(null);
    }

    function step(currentTime: number) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const currentVolume = startVolume + volumeChange * progress;
        setVolume(Math.floor(currentVolume));

        if (progress < 1) {
            animationFrameId = requestAnimationFrame(step);
            setFadeAnimationHandle(animationFrameId);
        } else {
            endFade(endVolume);
        }
    }

    let animationFrameId = requestAnimationFrame(step);
    setFadeAnimationHandle(animationFrameId);
}

export function fadeInputHandler(
    e: React.KeyboardEvent<HTMLInputElement>,
    { framePlayer, localVolumeControl, savedVolumeControl, fadeAnimationControl }: FadeOptions,
) {
    // Early return if no framePlayer or if the event key is not 'Enter'
    if (!framePlayer || e.key !== 'Enter') return;

    const inputValue = parseInt(e.currentTarget.value);
    if (isNaN(inputValue)) return;

    const targetVolume = inputValue > 100 ? 100 : inputValue; // check input to not go over 100

    let fadeAction;
    if (framePlayer.getPlayerState() !== 1 && targetVolume > 0) {
        fadeAction = fadeIn;
    } else if (framePlayer.getPlayerState() == 1 && targetVolume > 0) {
        fadeAction = fadeTo;
    } else if (framePlayer.getPlayerState() == 1 && targetVolume == 0) {
        fadeAction = fadeOut;
    } else {
        return;
    }

    // Execute the fading action with the provided parameters
    fadeAction({
        framePlayer,
        localVolumeControl,
        savedVolumeControl,
        fadeAnimationControl: fadeAnimationControl,
        pLimit: targetVolume,
    });
}

/* TO BE IMPLEMTNED: Crossfade two framePlayers */

