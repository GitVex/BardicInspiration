import { motion } from 'framer-motion';
import React, { useState } from 'react';
import FilterUI from './FilterUIMobile';
import { useWindowSize } from '../../Contexts/WindowSizeProvider';

function CreateSideMenu() {
    const [isOpenFilter, setIsOpenFilter] = useState(false);
    const { windowHeight } = useWindowSize();

    return (
        <>
            {windowHeight && (
                <>
                    <div
                        onClick={() =>
                            setIsOpenFilter((prevIsOpenCreate) => !prevIsOpenCreate)
                        }
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="h-12 w-12 cursor-pointer text-red-500 rounded-full bg-darknavy-500"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z"
                                style={{ transformOrigin: '50% 50%', transform: 'scale(0.75)' }}
                            ></path>
                        </svg>
                    </div>
                    <motion.div
                        className={`absolute z-10 top-0`}
                        initial={{ y: -windowHeight - 100 }}
                        transition={{ duration: 1, ease: 'easeInOut' }}
                        animate={isOpenFilter ? { y: 0 } : { y: -windowHeight - 100 }}
                    >
                        <div className={'relative backdrop-blur-md h-screen w-screen'}

                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.2}
                                stroke="currentColor"
                                className="absolute h-12 w-12 cursor-pointer text-red-500 right-4 top-4 rounded-full bg-darknavy-500"
                                onClick={() => setIsOpenFilter(false)}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 4.5v15m7.5-7.5h-15"
                                    style={{ transformOrigin: '50% 50%', transform: 'rotate(45deg)' }}
                                />
                            </svg>
                            <FilterUI />
                        </div>
                    </motion.div>
                </>
            )
            }
        </>
    );
}

export default CreateSideMenu;




