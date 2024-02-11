import React, { useContext, useState, useMemo, useReducer } from 'react';

import PlayerComponent from './PlayerComponent';
import WindowSizeContext from '../contexts/WindowSizeProvider';
import VolumeSlider from '../utils/VolumeSlider';
import {
	SelectionsState,
	selectionsReducer,
	VolumesState,
	volumesReducer,
	FadeIntervalsState,
	fadeIntervalsReducer,
	PlayerStateAction,
	playerStateReducer,
	PresetState,
} from './states';
import ControlPanel from './ControlPanel/ControlPanel';

const DEFAULT_VOLUME = 50;

const initialPresetState: PresetState = {
	title: 'New Preset',
	players: Array(8)
		.fill(null)
		.map((_, index) => ({
			title: `Player ${index + 1}`,
			selected: false,
			volume: DEFAULT_VOLUME,
			savedVolume: { hasSaved: false, prevVol: DEFAULT_VOLUME },
			pausedAt: Date.now(),
			url: '',
		})),
};

const initialFadeIntervals: FadeIntervalsState = {
	fadeIntervals: Array(9).fill(null),
};

function PlayerUI() {
	const context = useContext(WindowSizeContext);
	const windowHeight: number | undefined | null = context?.windowHeight;
	const windowWidth: number | undefined | null = context?.windowWidth;

	const [masterVolume, setMasterVolume] = useState(100);
	const [masterVolumeModifier, setMasterVolumeModifier] = useState(1);

	const [presetState, presetDispatch] = useReducer(
		playerStateReducer,
		initialPresetState
	);

	const [fadeIntervals, fadeIntervalDispatch] = useReducer(
		fadeIntervalsReducer,
		initialFadeIntervals
	);

	useMemo(() => {
		setMasterVolumeModifier(masterVolume / 100);
	}, [masterVolume]);

	return (
		<div
			className='absolute z-10 flex flex-row items-center justify-center gap-2 p-4 backdrop-blur-md'
			/* @ts-ignore */
			style={{ width: windowWidth, height: windowHeight }}
		>
			<div className='flex h-full w-fit flex-row items-center gap-4'>
				<div className='flex w-full flex-col items-center'>
					<div className='grid grid-cols-2 grid-rows-4 gap-2'>
						{[0, 1, 2, 3, 4, 5, 6, 7].map((id) => (
							<PlayerComponent
								key={id}
								playerId={id}
								masterVolumeModifier={masterVolumeModifier}
								player={presetState.players[id]}
								dispatch={presetDispatch}
								pCurrentFadeInterval={
									fadeIntervals.fadeIntervals[id]
								}
								pSetCurrentFadeInterval={(interval) =>
									fadeIntervalDispatch({
										type: 'setCurrentFadeInterval',
										index: id,
										payload: interval,
									})
								}
							/>
						))}
					</div>
				</div>
				<div className='flex w-28 flex-col items-center gap-4 rounded border-2 border-darknavy-700/50 bg-darknavy-500/50 p-1'>
					<p className='text-center'>Master Volume</p>
					<VolumeSlider
						volume={masterVolume}
						setVolume={setMasterVolume}
						height={500}
					/>
				</div>
			</div>

			<ControlPanel 
				states={presetState} 
				dispatch={presetDispatch} 
				fadeIntervals={fadeIntervals}
				fadeIntervalDispatch={fadeIntervalDispatch}/>
		</div>
	);
}

export default PlayerUI;
