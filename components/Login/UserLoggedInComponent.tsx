import React, { useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

function UserLoggedInComponent() {
	const { user, error, isLoading } = useUser();
	const [isModalOpen, setIsModalOpen] = useState(false);

	// Function to toggle modal visibility
	const toggleModal = () => {
		setIsModalOpen(!isModalOpen);
	};

	return (
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

			<AnimatePresence>
				{isModalOpen && (
					<motion.div
						initial={{ opacity: 0, y: -20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0}}
						transition={{ duration: 0.1 }}
						className='z-5 absolute top-full left-0 mt-2 flex w-max flex-col gap-2 rounded-lg border-2 border-darknavy-500 bg-darknavy-700 p-2 pr-8 text-sm text-darknavy-200 shadow-lg'
					>
						{/* Modal content goes here */}
						<p className=''>User</p>
                        <p className=''>Tracks</p>
                        <p className=''>Presets</p>
                        <p className=''>Saved</p>
                        <p className=''>Browse</p>
						{/* Add more content as needed */}
						<p className='cursor-pointer text-red-600'>
							{/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
							<a href='/api/auth/logout'>Logout</a>
						</p>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

export default UserLoggedInComponent;
