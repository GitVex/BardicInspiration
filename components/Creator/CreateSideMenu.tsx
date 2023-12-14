import React, { useState, useContext } from 'react';
import WindowWidthContext from '../contexts/WindowSizeProvider';
import { breakpoints } from '../utils/breakpoints';
import { motion } from 'framer-motion';
import CreateUI from './CreateUI';
import UserMenu from '../Login/UserMenu';
import { menu } from '@material-tailwind/react';

const menuWidth = 500;

const SideBarVariants = {
	closed: {
		x: -1 * menuWidth,
	},
	open: {
		x: 0,
	},
};

const PlusVariants = {
	closed: {
		rotate: 0,
	},
	open: {
		rotate: 45,
	},
};

function CreateSideMenu({ className }: { className?: string }) {
	const [isOpenCreate, setIsOpenCreate] = useState(false);

	const style = className ? className : '';

	const context = useContext(WindowWidthContext);
	const windowWidth = context?.windowWidth;

	return windowWidth !== undefined &&
		windowWidth !== null &&
		windowWidth >= breakpoints.sm ? (
		<motion.div
			className={`relative ${style}`}
			animate={isOpenCreate ? 'open' : 'closed'}
			initial='closed'
			variants={SideBarVariants}
		>
			<div
				className='absolute -left-6 -top-6 z-10 h-screen backdrop-blur-md'
				style={{ width: menuWidth }}
			>
				<CreateUI />
			</div>

			<motion.div
				className={`absolute z-10`}
				style={{ left: menuWidth }}
				onClick={() =>
					setIsOpenCreate((prevIsOpenCreate) => !prevIsOpenCreate)
				}
				variants={PlusVariants}
				animate={isOpenCreate ? 'open' : 'closed'}
			>
				<svg
					xmlns='http://www.w3.org/2000/svg'
					fill='none'
					viewBox='0 0 24 24'
					strokeWidth={1.5}
					stroke='currentColor'
					className='h-6 w-6 cursor-pointer text-[#FF0000]'
				>
					<path
						strokeLinecap='round'
						strokeLinejoin='round'
						d='M12 4.5v15m7.5-7.5h-15'
					/>
				</svg>
			</motion.div>

			<div className='relative ' style={{ left: menuWidth + 48, transform: 'translateY(-2px)' }}>
				<UserMenu />
			</div>
		</motion.div>
	) : (
		<div />
	);
}

export default CreateSideMenu;
