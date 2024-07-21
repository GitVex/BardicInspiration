import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useWindowSize } from '../Contexts/WindowSizeProvider';
import CreateUI from './CreateUI';

const menuWidth = 500;

const SideBarVariants = {
    closed: {
        x: -1 * menuWidth,
    },
    open: {
        x: 0,
    },
};

const PlusVariants = {
    closed: {
        rotate: 0,
    },
    open: {
        rotate: 45,
    },
};

function CreateSideMenu() {
    const [isOpenCreate, setIsOpenCreate] = useState(false);
    const { isMobile } = useWindowSize();

    return !isMobile ? (
        <motion.div
            className={`relative z-10`}
            animate={isOpenCreate ? 'open' : 'closed'}
            initial="closed"
            variants={SideBarVariants}
        >
            <div
                className="absolute -left-6 -top-6 z-10 h-screen backdrop-blur-md"
                style={{ width: menuWidth }}
            >
                <CreateUI />
            </div>

            <motion.div
                className={`absolute z-10`}
                style={{ left: menuWidth }}
                onClick={() =>
                    setIsOpenCreate((prevIsOpenCreate) => !prevIsOpenCreate)
                }
                variants={PlusVariants}
                animate={isOpenCreate ? 'open' : 'closed'}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-6 w-6 cursor-pointer text-[#FF0000]"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4.5v15m7.5-7.5h-15"
                    />
                </svg>
            </motion.div>
        </motion.div>
    ) : (
        <></>
    );
}

export default CreateSideMenu;
