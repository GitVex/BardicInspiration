import React from 'react';
import { PlayerStateAction } from '../Player/Contexts/states';
import IFPlayer from '../Player/types/IFPlayer';
import { getVideoIdFromYoutubeUrl } from '../../utils/youtubeUrl';

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
    volume?: number,
    startSeconds: number = 0,
) {
    if (!framePlayer) return;

    const target = transformToTarget(input);
    if (!target) return;

    framePlayer.setVolume(volume ?? framePlayer.getVolume());

    // cueVideoById, not loadVideoById: loading starts playback, and pausing it before the first
    // frame is painted leaves the iframe black with no controls until something plays it again.
    // Cueing lands directly in the state we actually want - poster shown, positioned at the start
    // offset, silent.
    framePlayer.cueVideoById(target, startSeconds);

    dispatch({
        type: 'setId',
        index: playerId,
        payload: target,
    });
}
