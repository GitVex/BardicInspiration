import React, { createContext, useContext, useEffect, useState } from 'react';

interface WindowSizeContextType {
    windowWidth: number | null;
    windowHeight: number | null;
}

const WindowSizeContext = createContext<WindowSizeContextType>({
    windowWidth: null,
    windowHeight: null,
});

interface WindowSizeProviderProps {
    children: React.ReactNode;
}

export const WindowSizeProvider: React.FC<WindowSizeProviderProps> = ({ children }) => {
    const [windowWidth, setWindowWidth] = useState<number | null>(null);
    const [windowHeight, setWindowHeight] = useState<number | null>(null);

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
            setWindowHeight(window.innerHeight);
        };

        handleResize(); // Set initial values on mount
        window.addEventListener('resize', handleResize);

        // Cleanup function: remove the event listener when the component unmounts
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return <WindowSizeContext.Provider value={{ windowWidth, windowHeight }}>{children}</WindowSizeContext.Provider>;
};

export const useWindowSize = (): WindowSizeContextType => {
    const context = useContext(WindowSizeContext);
    if (!context) {
        throw new Error('useWindowSize must be used within a WindowSizeProvider');
    }
    return context;
};