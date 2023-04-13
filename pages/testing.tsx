import React, { useState, useEffect, useContext } from 'react';
import WindowSizeContext from '../components/contexts/WindowSizeProvider';
import Create from '../components/rebuiltComponents/Create';
import { breakpoints } from '../components/rebuiltComponents/breakpoints';
import Filter from '../components/rebuiltComponents/Filter';
import {
	Viewer,
	ViewColumn,
} from '../components/rebuiltComponents/Viewer/Viewer';

function testing() {
	const [isOpenPlayer, setIsOpenPlayer] = useState(false);

	useEffect(() => {
		console.log(isOpenPlayer);
	}, [isOpenPlayer]);

	const context = useContext(WindowSizeContext);
	const windowWidth = context?.windowWidth;
	const windowHeight = context?.windowHeight;

	function renderDivs() {
		if (windowWidth) {
			let numberOfDivs: number, widthClass: string;

			if (windowWidth >= breakpoints.lg) {
				numberOfDivs = 4;
				widthClass = 'w-1/4';
			} else if (windowWidth >= breakpoints.md) {
				numberOfDivs = 3;
				widthClass = 'w-1/3';
			} else if (windowWidth >= breakpoints.sm) {
				numberOfDivs = 2;
				widthClass = 'w-1/2';
			} else {
				numberOfDivs = 1;
				widthClass = 'w-full';
			}

			return (
				<>
					{Array.from({ length: numberOfDivs }).map((_, index) => (
						<ViewColumn
							key={index}
							className={`${widthClass} overflow-y-auto rounded bg-slate-500/25`}
							style={
								windowHeight
									? { height: windowHeight - 4*24 }
									: { height: '100%' }
							}
						/>
					))}
				</>
			);
		}
	}

	return (
		<div className='h-screen overflow-hidden'>
			<div className='flex h-full flex-col gap-6 p-6'>
				<div className='flex w-full flex-row justify-between'>
					<Create>
						<div className='flex h-full w-full flex-col gap-2 p-6'>
							<div className='h-1/3 w-full rounded bg-emerald-500' />
							<div className='h-1/3 w-full rounded bg-amber-500' />
							<div className='h-1/3 w-full rounded bg-indigo-500' />
						</div>
					</Create>

					<div
						className='flex justify-center'
						onClick={() =>
							setIsOpenPlayer(
								(prevIsOpenPlayer) => !prevIsOpenPlayer
							)
						}
					>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							fill='none'
							viewBox='0 0 24 24'
							strokeWidth={1.5}
							stroke='currentColor'
							className='h-6 w-6 scale-x-[350%] cursor-pointer text-[#FF0000]'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								d='M19.5 8.25l-7.5 7.5-7.5-7.5'
							/>
						</svg>
					</div>

					<Filter>
						<div className='flex h-full w-full flex-col gap-2 p-6'>
							<div className='h-1/3 w-full rounded bg-emerald-500' />
							<div className='h-1/3 w-full rounded bg-amber-500' />
							<div className='h-1/3 w-full rounded bg-indigo-500' />
						</div>
					</Filter>
				</div>

				<Viewer className={`flex w-full flex-1 flex-row gap-6`}>
					{renderDivs()}
				</Viewer>
			</div>
		</div>
	);
}

export default testing;
