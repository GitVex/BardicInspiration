import { useEffect, useRef } from 'react';
import styles from './Viewer.module.css';

interface ScrollTitleProps {
    title: string;
}

function ScrollTitle({ title }: ScrollTitleProps) {
    const titleRef = useRef<HTMLParagraphElement>(null);
    const needsScroll = useRef<boolean>(false);

    const handleMouseEnter = (needsScroll: boolean) => {
        if (needsScroll) {
            const textElement = titleRef.current;
            if (textElement !== null) {
                textElement.classList.add(styles.scroll_text);
            }
        }
    }

    const handleMouseLeave = () => {
        const textElement = titleRef.current;
        if (textElement !== null) {
            textElement.classList.remove(styles.scroll_text);
        }
    }

    useEffect(() => {
        const textElement = titleRef.current;
        if (textElement !== null) {
            if (textElement.scrollWidth > textElement.clientWidth) {
                const translateValue = -(textElement.scrollWidth - textElement.clientWidth + 10) + 'px';
                textElement.style.setProperty('--translateX', translateValue);
                needsScroll.current = true;
            } else {
                textElement.style.setProperty('--translateX', '0px');
                needsScroll.current = false;
            }
        }
    }, [title, titleRef]);

    return (
        <p ref={titleRef} onMouseEnter={() => handleMouseEnter(needsScroll.current)} onMouseLeave={handleMouseLeave}>
            {title}
        </p>
    );
}

export default ScrollTitle;
