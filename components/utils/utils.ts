import React from 'react';
import { PlayerStateAction } from '../Contexts/states';
import IFPlayer from '../Player/types/IFPlayer';
import { FadeOptions, fadeIn, fadeTo } from '../Player/fadeFunctions';

function findExtremeIndex(
	array: number[],
	compare: (a: number, b: number) => boolean
): number {
	if (array.length === 0) {
		throw new Error('Cannot find extreme index of an empty array');
	}

	let extremeIndex = 0;
	let extremeValue = array[0];

	for (let i = 1; i < array.length; i++) {
		if (compare(array[i], extremeValue)) {
			extremeValue = array[i];
			extremeIndex = i;
		}
	}

	return extremeIndex;
}

export function argMax(array: number[]): number {
	return findExtremeIndex(array, (a, b) => a > b);
}

export function argMin(array: number[]): number {
	return findExtremeIndex(array, (a, b) => a < b);
}

function getVideoIdFromYoutubeUrl(url: string) {
	const regex =
		/(?:youtu\.be\/|youtube\.com(?:\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=|shorts\/)|youtu\.be\/|embed\/|v\/|m\/|watch\?(?:[^=]+=[^&]+&)*?v=))([^"&?\/\s]{11})/gm;
	const match = regex.exec(url);
	if (!match) {
		throw new Error('Invalid youtube url');
	}
	return match[1];
}

export function transformToTarget(input: string) {
	if (!input) {
		return null;
	}

	// Check if it's just the video ID
	if (input.length === 11) {
		return input;
	} else {
		return getVideoIdFromYoutubeUrl(input);
	}
}

export function fadeInputHandler(
    e: React.KeyboardEvent<HTMLInputElement>,
    { framePlayer, localVolumeControl, savedVolumeControl, fadeIntervalControl }: FadeOptions
) {
    // Early return if no framePlayer or if the event key is not 'Enter'
    if (!framePlayer || e.key !== 'Enter') return;

    const inputValue = parseInt(e.currentTarget.value); // Directly access the input's value
    const targetVolume = inputValue > 100 ? 100 : inputValue; // check input to not go over 100

    // Further validation to proceed only if inputValue is a valid number
    if (isNaN(targetVolume)) return;

    // Define a callback to handle fading, choosing between fadeIn and fadeTo based on player state
    const fadeAction = framePlayer.getPlayerState() !== 1 ? fadeIn : fadeTo;

    // Execute the fading action with the provided parameters
    fadeAction({
        framePlayer,
        localVolumeControl,
        savedVolumeControl,
        fadeIntervalControl,
        pLimit: targetVolume,
    });
}

export function loadNewVideo(
    playerId: number,
    dispatch: React.Dispatch<PlayerStateAction>,
    framePlayer: IFPlayer,
    input: string,
    volume?: number
) {
    if (!framePlayer) return;

    const target = transformToTarget(input);
    if (!target) return;

    framePlayer.setVolume(volume ?? framePlayer.getVolume());
    framePlayer.loadVideoById(target);
    framePlayer.pauseVideo();

    dispatch({
        type: 'setId',
        index: playerId,
        payload: target,
    });

    setTimeout(() => {
        framePlayer.pauseVideo();
        framePlayer.seekTo(0, true);
        framePlayer.setLoop(true);
    }, 1000);
}
