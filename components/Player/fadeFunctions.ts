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

/** What a synced fade locks to, so a group of players starts and lands together. */
export const SYNC_FADE_DURATION = 4000;

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
    const duration = sync ? SYNC_FADE_DURATION : durationMs ?? DEFAULT_FADE_DURATION(volumeChange);
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

export function fadeTo({
                           framePlayer,
                           localVolumeControl,
                           fadeAnimationControl,
                           pLimit = 50,
                           sync = false,
                           durationMs,
                       }: FadeOptions) {
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
    const duration = sync ? SYNC_FADE_DURATION : durationMs ?? DEFAULT_FADE_DURATION(volumeChange);
    const startTime = performance.now();

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

/**
 * Sends one player to an absolute volume, picking the fade that fits where it currently is.
 *
 * The three fades are not interchangeable: a paused player has to be started rather than ramped
 * from a level it is not playing at, and a target of zero has to pause it once it arrives. This
 * is the single place that decides between them, so the fade-to field and the hotkeys cannot
 * disagree about what "fade to 30" means.
 */
export function fadeToVolume(options: FadeOptions) {
    const { framePlayer, pLimit = 50 } = options;
    if (!framePlayer) return;

    const targetVolume = Math.max(0, Math.min(100, pLimit));
    const playing = framePlayer.getPlayerState() === 1;

    // A paused player asked for silence is already there
    if (!playing && targetVolume === 0) return;

    const fadeAction = !playing ? fadeIn : targetVolume > 0 ? fadeTo : fadeOut;

    fadeAction({ ...options, pLimit: targetVolume });
}

export function fadeInputHandler(
    e: React.KeyboardEvent<HTMLInputElement>,
    { framePlayer, localVolumeControl, savedVolumeControl, fadeAnimationControl }: FadeOptions,
) {
    // Early return if no framePlayer or if the event key is not 'Enter'
    if (!framePlayer || e.key !== 'Enter') return;

    const inputValue = parseInt(e.currentTarget.value);
    if (isNaN(inputValue)) return;

    fadeToVolume({
        framePlayer,
        localVolumeControl,
        savedVolumeControl,
        fadeAnimationControl,
        pLimit: inputValue,
    });
}

/* TO BE IMPLEMTNED: Crossfade two framePlayers */

