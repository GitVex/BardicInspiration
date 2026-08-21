import Slider from '@mui/material/Slider';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { LocalVolumeControlEndType } from './types/states';
import styles from './VolumeSlider.module.css';

const theme = createTheme({
    components: {
        MuiSlider: {
            styleOverrides: {
                root: {
                    color: '#FF0000',
                    '&.Mui-active': {
                        color: '#FF0000',
                    },
                },
                thumb: {
                    backgroundColor: 'red',
                },
                track: {
                    color: 'red',
                },
                rail: {
                    color: '#8B0F2A',
                },
                valueLabel: {
                    backgroundColor: 'transparent',
                    transform: 'translateX(20px)',
                },
            },
        },
    },
});

interface VolumeSliderProps {
    volumeControl: LocalVolumeControlEndType;
    className?: string;
    textBgColor?: string;
    height?: number | string;
    opaque?: boolean;
    bordered?: boolean;
    /**
     * Keeps the value label on screen instead of fading it out after an idle moment.
     *
     * The auto-hide saves horizontal space, which matters where the slider sits in a narrow
     * column, but it also means the level can only be read by nudging the slider. Somewhere with
     * room to spare is better off showing it permanently.
     */
    persistLabel?: boolean;
}

const VolumeSlider = ({
    volumeControl,
    height,
    opaque = false,
    bordered = false,
    persistLabel = true,
}: VolumeSliderProps) => {
    const { localVolume, setLocalVolume } = volumeControl;

    const [labelCenter, setLabelCenter] = useState(0);

    const containerRef = useRef<HTMLDivElement | null>(null);
    const sliderRef = useRef<HTMLSpanElement | null>(null); // MUI Slider usually forwards ref to a span

    const labelTimeoutIDRef = useRef<NodeJS.Timeout | null>(null);
    const [showLabel, setShowLabel] = useState(false);

    // The timer is only ever the auto-hide path's business; a persistent label never schedules one
    const delayHideLabel = useCallback(() => {
        if (persistLabel) return;

        setShowLabel(true);
        if (labelTimeoutIDRef.current) clearTimeout(labelTimeoutIDRef.current);
        labelTimeoutIDRef.current = setTimeout(() => setShowLabel(false), 2500);
    }, [persistLabel]);

    // Without this a slider unmounted mid-countdown - a player rebuild, a preset swap - still had a
    // pending timeout setting state on a gone component
    useEffect(() => () => {
        if (labelTimeoutIDRef.current) clearTimeout(labelTimeoutIDRef.current);
    }, []);

    const labelVisible = persistLabel || showLabel;

    useEffect(() => {
        if (sliderRef.current && containerRef.current) {
            const thumbRef = sliderRef.current.querySelector('.MuiSlider-thumb') as HTMLSpanElement;

            if (thumbRef) {
                const thumbRect = thumbRef.getBoundingClientRect();
                const containerRect = containerRef.current.getBoundingClientRect();

                const centerPosition = (thumbRect.y - containerRect.y) + (thumbRect.height / 2);

                delayHideLabel();
                setLabelCenter(centerPosition);
            }
        }
    }, [delayHideLabel, localVolume]);

    const handleVolumeChange = useCallback((value: number) => setLocalVolume(value), [setLocalVolume]);

    return (
        <div
            ref={containerRef} // Attach ref here
            className={`${styles.container} relative rounded ${bordered ? 'border-2' : ''} border-darknavy-400/25`}
            style={{ height: height ?? '80%' }}
        >
            <ThemeProvider theme={theme}>
                <Slider
                    orientation="vertical"
                    value={localVolume}
                    onChange={(e, val) => handleVolumeChange(val as number)}
                    ref={sliderRef}
                    size="small"
                />
            </ThemeProvider>

            <motion.p
                className={`absolute m-0 leading-none flex items-center justify-center ${opaque ? 'bg-darknavy-500' : ''} min-w-[26px]`}

                style={{ top: labelCenter }}
                animate={{
                    y: '-50%',
                    x: labelVisible ? -20 : -40,
                    opacity: labelVisible ? 1 : 0,
                    transition: {
                        y: { duration: 0 },
                        opacity: { duration: 0.2 },
                        x: { type: 'spring', stiffness: 300, damping: 30 },
                    },
                }}
            >
                {localVolume}
            </motion.p>
        </div>
    );
};

export default VolumeSlider;
