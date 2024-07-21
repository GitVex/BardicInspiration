import React, { useState } from 'react';
import { motion } from 'framer-motion';

function Tester() {
    const [isOpenFilter, setIsOpenFilter] = useState(false);

    const radius = 24;
    const circumference = 2 * Math.PI * radius;
    const distance = 1 * circumference;
    const rotation = (distance / circumference) * 360;

    return (
        <div className={`flex h-screen w-screen place-content-center items-center`}>
            <div
                onClick={() =>
                    setIsOpenFilter((prevIsOpenCreate) => !prevIsOpenCreate)
                }
                className={'drop-shadow-2xl'}
            >
                <motion.svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className={`h-12 w-12 cursor-pointer text-red-500 rounded-full bg-darknavy-500`}
                    animate={isOpenFilter ? { rotate: rotation, x: distance } : { rotate: 0, x: 0 }}
                    transition={{ duration: .75 * (distance / 100), ease: 'easeInOut' }}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z"
                        style={{ transformOrigin: '50% 50%', transform: 'scale(0.75)' }}
                    ></path>
                </motion.svg>
            </div>
        </div>
    );
}

export default Tester;
