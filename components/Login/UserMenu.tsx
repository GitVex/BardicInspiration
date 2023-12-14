import React from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import UserDisplayComponent from './UserDisplayComponent';

function UserMenu() {
	const { user, error, isLoading } = useUser();

	return (
		<div className={/* 'absolute left-4 top-4' */ ''}>
			{user ? (
				<UserDisplayComponent />
			) : (
				<>
					{/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
					<a href='/api/auth/login'>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							fill='none'
							viewBox='0 0 24 24'
							strokeWidth={1.5}
							stroke='currentColor'
							className='h-8 w-8 text-red-600'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								d='M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z'
							/>
						</svg>
					</a>
				</>
			)}
		</div>
	);
}

export default UserMenu;
