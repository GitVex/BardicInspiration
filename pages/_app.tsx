import "../styles/globals.css";
import type { AppProps } from "next/app";
import { WindowSizeProvider } from "../components/Contexts/WindowSizeProvider";

// Chatty debug output is silenced in production, but console.warn and console.error are left
// alone: they are how the YouTube iframe API, React and the browser report the failures that
// only ever happen in the deployed environment.
if (process.env.NODE_ENV !== "development") {
    console.log = () => {};
    console.debug = () => {};
    console.info = () => {};
}

export default function App({ Component, pageProps }: AppProps) {
	return (
		<WindowSizeProvider>
			<Component {...pageProps} />
		</WindowSizeProvider>
	);
}
