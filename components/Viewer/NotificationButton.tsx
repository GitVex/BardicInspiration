// components/NotificationButton.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NotificationButtonProps {
	id: number;
	className?: string;
	color?: string;
	luminance?: number;
	children?: React.ReactNode;
	onClick?: () => void;
}

const NotificationButton: React.FC<NotificationButtonProps> = ({
	id,
	className = '',
	color,
	luminance,
	children,
	onClick = () => {},
}) => {
	const [showNotification, setShowNotification] = useState(false);
	const [shadow, setShadow] = useState(false);

	const handleButtonClick = () => {
		setShowNotification(true);
		setShadow(true);
		setTimeout(() => {
			setShowNotification(false);
		}, 2000);
		setTimeout(() => {
			setShadow(false);
		}, 3000);
	};

	return (
		<div className={shadow ? 'relative' : ''} onClick={onClick}>
			<AnimatePresence>
				{showNotification && (
					<motion.div
						initial={{
							opacity: 0,
							scale: 0.9,
						}}
						animate={{
							opacity: 1,
							scale: 1,
							y: '-120%',
						}}
						exit={{
							opacity: 0,
							scale: 0.9,
						}}
						transition={{
							duration: 0.2,
							type: 'spring',
							mass: 0.8,
						}}
						className='absolute z-50 h-5 w-full text-red-600'
					>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							fill='none'
							viewBox='0 0 24 24'
							strokeWidth='1.5'
							stroke='currentColor'
							className='h-5 w-full'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								d='M4.5 12.75l6 6 9-13.5'
							/>
						</svg>
					</motion.div>
				)}
			</AnimatePresence>
			<button
				id={'notification-button-' + id}
				className={`hover:bg-blue-500'} flex w-auto flex-col justify-items-center rounded border border-blue-500 px-2 py-1 font-semibold text-white duration-200 ${className}`}
				onClick={handleButtonClick}
			>
				{children}
			</button>
			<style>
				{color
					? `
				#notification-button-${id}:hover {
					border-color: ${color};
					background-color: ${color};
					${luminance ? (luminance > 0.5 ? 'color: black' : '') : ''}
				}
			`
					: ''}
			</style>
		</div>
	);
};

export default NotificationButton;
