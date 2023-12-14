import React from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import Image from 'next/image';

function Tester() {
	const { user, error, isLoading } = useUser();

	let display;

	if (isLoading) display = <div>Loading...</div>;
	else if (error) display = <div>{error.message}</div>;

	return (
		<div className='flex h-screen items-center justify-center'>
			{user ? (
				<div>
					<div className='flex flex-row gap-2'>
						<p>Hi {user.name}</p>
						{user.picture && (
							<Image
								src={user.picture}
								width={20}
								height={20}
								alt=''
								className='rounded-full'
							/>
						)}
					</div>
					<div>Here's your user info:</div>
					<div>{JSON.stringify(user, null, 2)}</div>
					{/* eslint-disable-next-line @next/next/no-html-link-for-pages */}

					{/* Create a button which calls the api at api/cron/removeUnavailableEntries */}
					<div>
						{/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
						<a href='/api/cron/removeUnavailableEntries'>
							Remove Unavailable Entries
						</a>
					</div>

					{/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
					<a href='/api/auth/logout'>Logout</a>
				</div>
			) : (
				<>
					{/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
					<a href='/api/auth/login'>Login</a>
				</>
			)}
		</div>
	);
}

export default Tester;
