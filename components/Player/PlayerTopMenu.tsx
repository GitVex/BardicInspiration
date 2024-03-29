import React, {
	useReducer,
	useContext,
	useMemo,
	useEffect,
	useState,
} from 'react';
import { motion } from 'framer-motion';
import PlayerUI from './PlayerUI';
import { breakpoints } from '../utils/breakpoints';
import WindowSizeContext from '../contexts/WindowSizeProvider';

let DEFAULT_ISOPENPLAYER_STATE: boolean;
if (process.env.NODE_ENV !== "development") {
    DEFAULT_ISOPENPLAYER_STATE = true;
} else {
	DEFAULT_ISOPENPLAYER_STATE = false;
}

function PlayerTopMenu() {
	const context = useContext(WindowSizeContext);
	const windowHeight = context?.windowHeight;
	const windowWidth = context?.windowWidth;

	useEffect(() => {
		window.addEventListener('keydown', handleKeyPress);
		return () => {
			window.removeEventListener('keydown', handleKeyPress);
		};
	}, []);

	
	const [isOpenPlayer, setIsOpenPlayer] = useState(DEFAULT_ISOPENPLAYER_STATE);
	const yInit = windowHeight ? windowHeight * -1 : -1000;

	// create a listener that listens for the spacebar keypress
	// if the spacebar is pressed, then toggle the isOpenPlayer state
	const handleKeyPress = (e: KeyboardEvent) => {
		// ignore the spacebar keypress if the user is typing in an input field
		if (e.target instanceof HTMLInputElement) return;

		if (e.code === 'Space') {
			setIsOpenPlayer((prevIsOpenPlayer) => !prevIsOpenPlayer);
		}
	};

	const buttonVariants = {
		closed: {
			scaleY: 1,
		},
		open: {
			scaleY: -1,
		},
	};

	return windowWidth !== undefined &&
		windowWidth !== null &&
		windowWidth >= breakpoints.lg ? (
		<>
			<motion.div
				className='relative z-20 flex justify-center'
				onClick={() =>
					setIsOpenPlayer((prevIsOpenPlayer) => !prevIsOpenPlayer)
				}
				variants={buttonVariants}
				animate={isOpenPlayer ? 'open' : 'closed'}
			>
				<svg
					xmlns='http://www.w3.org/2000/svg'
					fill='none'
					viewBox='0 0 132 24'
					strokeWidth={2}
					stroke='currentColor'
					className='h-6 w-36 cursor-pointer text-red-600'
				>
					<path
						strokeLinecap='round'
						strokeLinejoin='round'
						d='M107.5 8.25l-41.25 7.5-41.25-7.5'
					/>
				</svg>
			</motion.div>

			{/* Overlay */}
			<motion.div
				initial={{ y: yInit }}
				animate={isOpenPlayer ? { y: 0 } : { y: yInit }}
				transition={{ duration: 1, ease: 'easeInOut' }}
				className='absolute top-0 left-0'
			>
				{/* @ts-ignore */}
				<PlayerUI />
			</motion.div>
		</>
	) : (
		<div className='h-6' />
	);
}

export default PlayerTopMenu;
