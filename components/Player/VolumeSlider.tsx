import Slider from '@mui/material/Slider';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useEffect, useCallback, useRef, useState } from 'react';
import { localVolumeControlEndType } from './types/states';
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
    volumeControl: localVolumeControlEndType;
    className?: string;
    textBgColor?: string;
    height?: number | string;
    opaque?: boolean;
}

const VolumeSlider = ({ volumeControl, height, opaque = false }: VolumeSliderProps) => {
    const { localVolume, setLocalVolume } = volumeControl;

    const [labelHeight, setLabelHeight] = useState(0);
    const sliderRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (sliderRef.current) {
            const thumbRef = sliderRef.current.querySelector('.MuiSlider-thumb') as HTMLDivElement;
            const thumbRect = thumbRef.getBoundingClientRect();

            const sliderRect = sliderRef.current.getBoundingClientRect();

            setLabelHeight(thumbRect.y - sliderRect.y + thumbRect.height / 2 - 12);
        }
    }, [localVolume]);

    const handleVolumeChange = useCallback(
        (value: number) => {
            setLocalVolume(value);
        },
        [setLocalVolume],
    );

    return (
        <div className={`${styles.container} rounded border-2 border-darknavy-400/25`}
             style={{ height: height ?? '80%' }}>
            <ThemeProvider theme={theme}>
                <Slider
                    orientation="vertical"
                    value={localVolume}
                    onChange={(e, val) => {
                        handleVolumeChange(val as number);
                    }}
                    style={{ height: '90%' }}
                    aria-labelledby="vertical-slider"
                    size="small"
                    // valueLabelDisplay={'on'}
                    ref={sliderRef}
                />
            </ThemeProvider>

            <div style={{ height: `90%` }}>
                <motion.p
                    className={`absolute ${opaque ? 'bg-darknavy-500' : ''} min-w-[26px]`}
                    animate={{
                        y: labelHeight,
                        transition: { ease: 'easeOut', duration: 0.5 },
                    }}
                >
                    {localVolume}
                </motion.p>
            </div>
        </div>
    );
};

export default VolumeSlider;
