import '../styles/globals.css';
import type { AppProps, NextWebVitalsMetric } from 'next/app';
import { Analytics } from '@vercel/analytics/react';
import { WindowSizeProvider } from '../components/contexts/WindowSizeProvider';
import { UserProvider } from '@auth0/nextjs-auth0/client';

if (process.env.NODE_ENV !== 'development') {
	console.log = () => {};
	console.debug = () => {};
	console.info = () => {};
	console.warn = () => {};
}

export default function App({ Component, pageProps }: AppProps) {
	return (
		<>
			<WindowSizeProvider>
				<UserProvider>
					<Component {...pageProps} />
				</UserProvider>
			</WindowSizeProvider>
			<Analytics />
		</>
	);
}

export function reportWebVitals(metric: NextWebVitalsMetric) {
	console.log(metric);
}
