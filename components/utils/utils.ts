import React from 'react';
import { PlayerStateAction } from '../Player/Contexts/states';
import IFPlayer from '../Player/types/IFPlayer';

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
