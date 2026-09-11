import { motion } from 'framer-motion';
import { useState } from 'react';
import FocusTrap from '@mui/material/Unstable_TrapFocus';
import CreateUI from '../CreateUI';
import { useWindowSize } from '../../Contexts/WindowSizeProvider';

export default function CreateSideMenuMobile() {
    const [isOpenCreate, setIsOpenCreate] = useState(false);
    const { windowHeight } = useWindowSize();
    return windowHeight ? (
        <>
            <button
                type="button"
                aria-label="Open creator"
                aria-expanded={isOpenCreate}
                onClick={() => setIsOpenCreate(value => !value)}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.2}
                    stroke="currentColor"
                    className="h-12 w-12 cursor-pointer rounded-full bg-darknavy-500 text-red-500"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
            </button>
            <motion.div
                className="fixed inset-0 z-50"
                initial={{ y: '-110%' }}
                transition={{ duration: 1, ease: 'easeInOut' }}
                animate={{ y: isOpenCreate ? '0%' : '-110%' }}
                aria-hidden={!isOpenCreate}
                style={{ pointerEvents: isOpenCreate ? 'auto' : 'none' }}
                onKeyDown={event => {
                    if (event.key === 'Escape') {
                        event.stopPropagation();
                        setIsOpenCreate(false);
                    }
                }}
            >
                <FocusTrap open={isOpenCreate}>
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-label="Add track"
                        tabIndex={-1}
                        style={{ height: '100dvh' }}
                        ref={node => {
                            if (node) {
                                if (isOpenCreate) node.removeAttribute('inert');
                                else node.setAttribute('inert', '');
                            }
                        }}
                    >
                        <CreateUI onClose={() => setIsOpenCreate(false)} isOpen={isOpenCreate} />
                    </div>
                </FocusTrap>
            </motion.div>
        </>
    ) : null;
}
