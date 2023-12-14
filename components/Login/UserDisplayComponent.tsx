import React, { useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import Image from 'next/image';
import { motion } from 'framer-motion';

function UserDisplayComponent() {
	const [isModalOpen, setIsModalOpen] = useState(false);

	// Function to toggle modal visibility
	const toggleModal = () => {
		setIsModalOpen(!isModalOpen);
	};

	const { user, error, isLoading } = useUser();

	let display;

	if (isLoading)
		display = (
			<div>
				<motion.svg
					xmlns='http://www.w3.org/2000/svg'
					fill='none'
					viewBox='0 0 24 24'
					strokeWidth='1.5'
					stroke='currentColor'
					className='h-6 w-6'
					animate={{ rotate: 360 }}
					transition={{
						repeat: Infinity,
						duration: 2,
						ease: 'linear',
					}}
				>
					<path
						strokeLinecap='round'
						strokeLinejoin='round'
						d='M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99'
					/>
				</motion.svg>
			</div>
		);
	else if (error)
		display = (
			<svg
				xmlns='http://www.w3.org/2000/svg'
				fill='none'
				viewBox='0 0 24 24'
				stroke-width='1.5'
				stroke='currentColor'
				className='h-8 w-8'
				style={{ color: 'red' }}
			>
				<path
					strokeLinecap='round'
					strokeLinejoin='round'
					d='M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z'
				/>
			</svg>
		);
	else if (user)
		display = (
			<div className='relative'>
				<div onClick={toggleModal} className='cursor-pointer'>
					<Image
						/* @ts-ignore */
						src={user.picture}
						alt='Profile Picture'
						width={32}
						height={32}
						className='rounded-full'
					/>
				</div>

				{isModalOpen && (
					<div className='absolute z-5 top-full left-0 mt-2 flex w-fit flex-col rounded-lg border border-darknavy-500 bg-darknavy-700 p-2 text-sm text-darknavy-200 shadow-lg'>
						{/* Modal content goes here */}
						<p className=''>User</p>
						{/* Add more content as needed */}
						<p className='text-red-600 cursor-pointer'>
							{/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
							<a href='/api/auth/logout'>Logout</a>
						</p>
					</div>
				)}
			</div>
		);

	return display ? (
		display
	) : (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			fill='none'
			viewBox='0 0 24 24'
			stroke-width='1.5'
			stroke='currentColor'
			className='h-8 w-8'
			style={{ color: 'red' }}
		>
			<path
				strokeLinecap='round'
				strokeLinejoin='round'
				d='M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z'
			/>
		</svg>
	);
}

export default UserDisplayComponent;
