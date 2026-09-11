import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useWindowSize } from '../Contexts/WindowSizeProvider';
import CreateUI from './CreateUI';

const menuWidth = 440;

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
    const trigger = useRef<HTMLButtonElement>(null);
    const panel = useRef<HTMLDivElement | null>(null);
    const close = () => {
        setIsOpenCreate(false);
        trigger.current?.focus();
    };
    useEffect(() => {
        if (!isOpenCreate) return;
        panel.current?.querySelector<HTMLButtonElement>('button')?.focus();
        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.stopPropagation();
                setIsOpenCreate(false);
                trigger.current?.focus();
            }
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [isOpenCreate]);
    const { isMobile } = useWindowSize();

    return !isMobile ? (
        <motion.div
            className={`relative z-10`}
            animate={isOpenCreate ? 'open' : 'closed'}
            initial="closed"
            variants={SideBarVariants}
        >
            <div
                ref={node => {
                    panel.current = node;
                    if (node) {
                        if (isOpenCreate) node.removeAttribute('inert');
                        else node.setAttribute('inert', '');
                    }
                }}
                aria-hidden={!isOpenCreate}
                className="absolute -left-4 -top-4 z-10 border-r border-darknavy-600 bg-darknavy-700 shadow-2xl"
                style={{ width: menuWidth, height: '100dvh' }}
            >
                <CreateUI onClose={close} isOpen={isOpenCreate} />
            </div>

            <motion.button
                ref={trigger}
                type="button"
                aria-label={isOpenCreate ? 'Close creator' : 'Open creator'}
                aria-expanded={isOpenCreate}
                className={`absolute z-10`}
                style={{ left: menuWidth }}
                onClick={() => setIsOpenCreate(prevIsOpenCreate => !prevIsOpenCreate)}
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
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
            </motion.button>
        </motion.div>
    ) : (
        <></>
    );
}

export default CreateSideMenu;
