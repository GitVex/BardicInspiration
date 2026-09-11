import Drawer from '@mui/material/Drawer';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import FilterUI from './FilterUI';

export default function FilterSideMenu({ mobile = false }: { mobile?: boolean }) {
    const [isOpen, setIsOpen] = useState(false);
    const trigger = useRef<HTMLButtonElement>(null);
    const panel = useRef<HTMLDivElement>(null);
    const close = () => {
        setIsOpen(false);
        if (!mobile) trigger.current?.focus();
    };

    useEffect(() => {
        if (!isOpen || mobile) return;
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                event.stopPropagation();
                setIsOpen(false);
                trigger.current?.focus();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, mobile]);

    return (
        // Keep the trigger and persistent Drawer in one header flex item.
        // The Drawer's root otherwise takes a separate justify-between slot.
        <div className="relative">
            <div className={mobile ? '' : 'relative z-[1201] h-fit'}>
                <motion.div
                    className={mobile ? '' : 'absolute right-0 flex flex-row gap-6'}
                    animate={{ x: !mobile && isOpen ? -440 : 0 }}
                    initial={false}
                >
                    {!mobile && !isOpen && (
                        <p className="cursor-default truncate opacity-50">Looking for something specific?</p>
                    )}
                    <button
                        ref={trigger}
                        type="button"
                        onClick={() => setIsOpen(previous => !previous)}
                        aria-expanded={isOpen}
                        aria-controls={isOpen ? 'filter-panel' : undefined}
                        aria-label={isOpen ? 'Close filters' : 'Open filters'}
                        className="shrink-0 focus-visible:outline focus-visible:outline-indigo-400"
                    >
                        <svg
                            aria-hidden="true"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className={
                                mobile
                                    ? 'h-12 w-12 cursor-pointer rounded-full bg-darknavy-500 text-red-500'
                                    : 'h-6 w-6 cursor-pointer text-[#FF0000]'
                            }
                        >
                            <motion.path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z"
                                style={mobile ? { transformOrigin: '50% 50%', transform: 'scale(0.75)' } : undefined}
                                variants={{ closed: { rotate: 0 }, open: { rotate: 45, d: 'M12 4.5v15m7.5-7.5h-15' } }}
                                animate={!mobile && isOpen ? 'open' : 'closed'}
                            />
                        </svg>
                    </button>
                </motion.div>
            </div>
            <Drawer
                anchor="right"
                variant={mobile ? 'temporary' : 'persistent'}
                open={isOpen}
                onClose={close}
                SlideProps={{
                    onEntered: () => {
                        if (!mobile) panel.current?.querySelector<HTMLButtonElement>('button')?.focus();
                    },
                }}
                PaperProps={{
                    id: 'filter-panel',
                    role: mobile ? 'dialog' : 'complementary',
                    'aria-modal': mobile ? true : undefined,
                    'aria-labelledby': 'filter-panel-title',
                    sx: {
                        width: mobile ? '100%' : 440,
                        maxWidth: '100vw',
                        height: '100dvh',
                        backgroundColor: '#060f1c',
                        backgroundImage: 'none',
                        borderLeft: '1px solid #081426',
                        boxShadow: '-12px 0 40px rgba(0,0,0,.35)',
                    },
                }}
            >
                <div
                    ref={panel}
                    className="h-full min-h-0"
                    onKeyDown={event => {
                        // Keep tag controls from triggering the player's global shortcuts.
                        if (event.key !== 'Escape') event.stopPropagation();
                    }}
                >
                    {isOpen && <FilterUI onClose={close} mobile={mobile} />}
                </div>
            </Drawer>
        </div>
    );
}
