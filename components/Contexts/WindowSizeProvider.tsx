import React, { createContext, useContext, useEffect, useState } from 'react';
import { breakpoints } from '../utils/breakpoints';

interface WindowSizeContextType {
    windowWidth: number | null;
    windowHeight: number | null;
    isMobile: boolean;
}

const WindowSizeContext = createContext<WindowSizeContextType>({
    windowWidth: null,
    windowHeight: null,
    isMobile: false,
});

interface WindowSizeProviderProps {
    children: React.ReactNode;
}

export const WindowSizeProvider: React.FC<WindowSizeProviderProps> = ({ children }) => {
    const [windowWidth, setWindowWidth] = useState<number | null>(null);
    const [windowHeight, setWindowHeight] = useState<number | null>(null);
    const [isMobile, setIsMobile] = useState<boolean>(false);

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            setWindowWidth(width);
            setWindowHeight(height);
            setIsMobile(width < breakpoints.lg);
        };

        handleResize(); // Set initial values on mount
        window.addEventListener('resize', handleResize);

        // Cleanup function: remove the event listener when the component unmounts
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <WindowSizeContext.Provider value={{ windowWidth, windowHeight, isMobile }}>
            {children}
        </WindowSizeContext.Provider>
    );
};

export const useWindowSize = (): WindowSizeContextType => {
    const context = useContext(WindowSizeContext);
    if (!context) {
        throw new Error('useWindowSize must be used within a WindowSizeProvider');
    }
    return context;
};
