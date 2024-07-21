import { motion } from 'framer-motion';
import React, { useState } from 'react';
import { useWindowSize } from '../Contexts/WindowSizeProvider';
import { breakpoints } from '../utils/breakpoints';
import FilterUI from './FilterUI';

const menuWidth = 500;

const SideBarVariants = {
    closed: {
        x: menuWidth,
    },
    open: {
        x: 0,
    },
};

const FilterIconVariants = {
    closed: {
        rotate: 0,
    },
    open: {
        rotate: 45,
        d: 'M12 4.5v15m7.5-7.5h-15',
    },
};

export default function FilterSideMenu() {
    const [isOpenFilter, setIsOpenFilter] = useState(false);

    const { windowWidth } = useWindowSize()

    return (
        <motion.div
            className="relative z-10 flex h-fit flex-row gap-2"
            variants={SideBarVariants}
            animate={isOpenFilter ? 'open' : 'closed'}
            initial="closed"
        >
            <div className="absolute flex flex-row gap-6" style={{ right: menuWidth }}>
                {windowWidth !== null && windowWidth !== undefined && !isOpenFilter && windowWidth > breakpoints.md ? (
                    <p className={'cursor-default truncate opacity-50'}>Looking for something specific?</p>
                ) : null}

                <button
                    className=""
                    style={{ left: -1 * (menuWidth + 30) }}
                    onClick={() => setIsOpenFilter(prevIsOpenFilter => !prevIsOpenFilter)}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="h-6 w-6 cursor-pointer text-[#FF0000]"
                    >
                        <motion.path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z"
                            variants={FilterIconVariants}
                            animate={isOpenFilter ? 'open' : 'closed'}
                        ></motion.path>
                    </svg>
                </button>
            </div>

            <motion.div
                className={'absolute -right-6 -top-6 h-screen overflow-hidden backdrop-blur-md'}
                style={{ width: menuWidth }}
            >
                <FilterUI />
            </motion.div>
        </motion.div>
    );
}

