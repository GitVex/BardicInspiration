declare global {
    interface Window {
        YT?: typeof YT;
        onYouTubeIframeAPIReady?: () => void;
    }
}

const SCRIPT_ID = 'yt-iframe-api';

// The YouTube API calls window.onYouTubeIframeAPIReady exactly once per page load, so the
// promise is kept at module scope: a StrictMode double-mount, a fast refresh or a remount
// all resolve against the same load instead of waiting on a callback that will never fire again.
let ytApiPromise: Promise<typeof YT> | null = null;

export function loadYouTubeApi(): Promise<typeof YT> {
    if (ytApiPromise) return ytApiPromise;

    ytApiPromise = new Promise<typeof YT>(resolve => {
        if (window.YT?.Player) {
            resolve(window.YT);
            return;
        }

        const prev = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
            prev?.();
            resolve(window.YT as typeof YT);
        };

        if (!document.getElementById(SCRIPT_ID)) {
            const tag = document.createElement('script');
            tag.id = SCRIPT_ID;
            tag.src = 'https://www.youtube.com/iframe_api';
            document.body.appendChild(tag);
        }
    });

    return ytApiPromise;
}
