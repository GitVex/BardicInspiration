import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useWindowSize } from '../Contexts/WindowSizeProvider';
import { DEFAULT_IS_OPEN_PLAYER_STATE } from '../utils/DEFAULTS';
import PlayerUI from './PlayerUI';
import PlayerHotkeys from './PlayerHotkeys';

function PlayerTopMenu() {
    const { isMobile } = useWindowSize();

    const [isOpenPlayer, setIsOpenPlayer] = useState(DEFAULT_IS_OPEN_PLAYER_STATE);

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

            <PlayerHotkeys isOpenPlayer={isOpenPlayer} setIsOpenPlayer={setIsOpenPlayer} />

            {/* Overlay. fixed inset-0 gives it the viewport as a definite box, so everything
                below can size itself in percentages instead of measured pixels. The slide is a
                percentage of the element's own height, so it needs no measurement either. */}
            <motion.div
                initial={{ y: '-100%' }}
                animate={isOpenPlayer ? { y: '0%' } : { y: '-100%' }}
                transition={{ duration: 1, ease: 'easeInOut' }}
                className="fixed inset-0 z-20"
                style={{ pointerEvents: isOpenPlayer ? 'auto' : 'none' }}
            >
                <PlayerUI />
            </motion.div>
        </>
    ) : (
        <div className="h-6" />
    );
}

export default PlayerTopMenu;
