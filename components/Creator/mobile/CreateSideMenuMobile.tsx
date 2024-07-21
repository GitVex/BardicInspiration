import { motion } from 'framer-motion';
import React, { useState } from 'react';
import CreateUI from '../CreateUI';
import { useWindowSize } from '../../Contexts/WindowSizeProvider';

function CreateSideMenu() {
    const [isOpenCreate, setIsOpenCreate] = useState(false);
    const { windowHeight } = useWindowSize();

    return (
        <>
            {windowHeight && (
                <>
                    <div
                        onClick={() =>
                            setIsOpenCreate((prevIsOpenCreate) => !prevIsOpenCreate)
                        }
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.2}
                            stroke="currentColor"
                            className="h-12 w-12 cursor-pointer text-red-500 rounded-full bg-darknavy-500"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 4.5v15m7.5-7.5h-15"
                            />
                        </svg>
                    </div>
                    <motion.div
                        className={`absolute z-10 top-0`}
                        initial={{ y: -windowHeight - 100 }}
                        transition={{ duration: 1, ease: 'easeInOut' }}
                        animate={isOpenCreate ? { y: 0 } : { y: -windowHeight - 100 }}
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
                                onClick={() => setIsOpenCreate(false)}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 4.5v15m7.5-7.5h-15"
                                    style={{ transformOrigin: '50% 50%', transform: 'rotate(45deg)' }}
                                />
                            </svg>
                            <CreateUI />
                        </div>
                    </motion.div>
                </>
            )
            }
        </>
    );
}

export default CreateSideMenu;
