import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useWindowSize } from '../Contexts/WindowSizeProvider';
import { DEFAULT_IS_OPEN_PLAYER_STATE } from '../utils/DEFAULTS';
import PlayerUI from './PlayerUI';

function PlayerTopMenu() {
    const { isMobile, windowHeight } = useWindowSize();

    useEffect(() => {
        window.addEventListener('keydown', handleKeyPress);
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, []);

    const [isOpenPlayer, setIsOpenPlayer] = useState(DEFAULT_IS_OPEN_PLAYER_STATE);
    const yInit = windowHeight ? windowHeight * -1 : -1000;

    // create a listener that listens for the space bar keypress
    // if the space bar is pressed, then toggle the isOpenPlayer state
    const handleKeyPress = (e: KeyboardEvent) => {
        // ignore the space bar keypress if the user is typing in an input field
        if (e.target instanceof HTMLInputElement) return;

        if (e.code === 'Space') {
            setIsOpenPlayer(prevIsOpenPlayer => !prevIsOpenPlayer);
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

    return !isMobile ? (
        <>
            <motion.div
                className="relative z-30 flex justify-center"
                onClick={() => setIsOpenPlayer(prevIsOpenPlayer => !prevIsOpenPlayer)}
                variants={buttonVariants}
                animate={isOpenPlayer ? 'open' : 'closed'}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 132 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="h-6 w-36 cursor-pointer text-red-600"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M107.5 8.25l-41.25 7.5-41.25-7.5" />
                </svg>
            </motion.div>

            {/* Overlay */}
            <motion.div
                initial={{ y: yInit }}
                animate={isOpenPlayer ? { y: 0 } : { y: yInit }}
                transition={{ duration: 1, ease: 'easeInOut' }}
                className="absolute z-20 top-0 left-0"
            >
                {/* @ts-ignore */}
                <PlayerUI />
            </motion.div>
        </>
    ) : (
        <div className="h-6" />
    );
}

export default PlayerTopMenu;
