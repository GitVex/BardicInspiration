import "../styles/globals.css";
import type { AppProps, NextWebVitalsMetric } from "next/app";
import { Analytics } from "@vercel/analytics/react";
import { WindowSizeProvider } from "../components/contexts/WindowSizeProvider";

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
			<Analytics />
		</>
	);
}

export function reportWebVitals(metric: NextWebVitalsMetric) {
	console.log(metric);
}
