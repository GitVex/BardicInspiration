import "../styles/globals.css";
import type { AppProps, NextWebVitalsMetric } from "next/app";
import { WindowSizeProvider } from "../components/Contexts/WindowSizeProvider";

if (process.env.NODE_ENV !== "development") {
    console.log = () => {};
    console.debug = () => {};
    console.info = () => {};
    console.warn = () => {};
}

export default function App({ Component, pageProps }: AppProps) {
	return (
		<>
			<WindowSizeProvider>
				<Component {...pageProps} />
			</WindowSizeProvider>
		</>
	);
}

export function reportWebVitals(metric: NextWebVitalsMetric) {
	console.log(metric);
}
