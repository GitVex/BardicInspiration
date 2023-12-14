import React, { useContext, useReducer, useMemo } from 'react';
import WindowSizeContext from './contexts/WindowSizeProvider';
import PlayerHolderProvider from './contexts/PlayerHolderProvider';
import { breakpoints } from './utils/breakpoints';
import FilterSideMenu from './Filter/FilterSideMenu';
import { Viewer } from './Viewer/Viewer';
import { ViewColumn } from './Viewer/ViewColumn';
import FilterStateProvider from './contexts/RebuiltFilterStateProvider';
import CreateSideMenu from './Creator/CreateSideMenu';
import PlayerTopMenu from './Player/PlayerTopMenu';
import UserDisplayComponent from './Login/UserDisplayComponent';
import UserMenu from './Login/UserMenu';

function PageComponent() {
	const context = useContext(WindowSizeContext);
	const windowWidth = context?.windowWidth;
	const windowHeight = context?.windowHeight;

	const renderDivs = useMemo(() => {
		function renderViewColumn(widthClass: string, type?: string) {
			return (
				<div
					className={`${widthClass} flex flex-col gap-2 overflow-x-hidden`}
					style={
						windowHeight
							? { height: windowHeight - 4 * 24 }
							: { height: '100%' }
					}
				>
					<p className='w-full rounded bg-indigo-900/25 text-center capitalize'>
						{type}
					</p>
					<div
						className={`h-full overflow-y-auto overflow-x-hidden scroll-smooth rounded bg-indigo-900/25 p-2`}
					>
						<ViewColumn type={type} />
					</div>
				</div>
			);
		}

		if (windowWidth) {
			let widthClass: string;
			let columns: string[];

			if (windowWidth >= breakpoints.lg) {
				widthClass = 'w-1/4';
				columns = ['new', 'filter', 'trend', 'owned'];
			} else if (windowWidth >= breakpoints.md) {
				widthClass = 'w-1/3';
				columns = ['new', 'filter', 'trend'];
			} else if (windowWidth >= breakpoints.sm) {
				widthClass = 'w-1/2';
				columns = ['new', 'trend'];
			} else {
				widthClass = 'w-full';
				return renderViewColumn(widthClass);
			}

			return (
				<React.Fragment>
					{columns.map((columnType) =>
						renderViewColumn(widthClass, columnType)
					)}
				</React.Fragment>
			);
		}
	}, [windowWidth, windowHeight]);

	return (
		<div className='h-screen overflow-hidden '>
			<div className='flex h-full flex-col gap-6 p-6'>
				<PlayerHolderProvider>
					<FilterStateProvider>
						<div className='flex w-full flex-row justify-between'>
							<CreateSideMenu />

							<PlayerTopMenu />

							<FilterSideMenu />
						</div>

						<Viewer className='flex flex-1 flex-row gap-4'>
							{renderDivs}
						</Viewer>
					</FilterStateProvider>
				</PlayerHolderProvider>
			</div>
		</div>
	);
}

export default PageComponent;
