import React from 'react';
import CreateSideMenu from './Creator/CreateSideMenu';
import CreateSideMenuMobile from './Creator/mobile/CreateSideMenuMobile';
import FilterSideMenu from './Filter/FilterSideMenu';
import FilterSideMenuMobile from './Filter/mobile/FilterSideMenuMobile';
import PlayerTopMenu from './Player/PlayerTopMenu';
import { Viewer } from './Viewer/Viewer';
import PlayerHolderProvider from './Contexts/PlayerHolderProvider';
import FilterStateProvider from './Contexts/FilterStateProvider';
import { useWindowSize } from './Contexts/WindowSizeProvider';
import { StackControlsProvider } from './Contexts/StackControlsProvider';
import PresetProvider from './Player/Contexts/PresetProvider';

function MainApp() {
    const { isMobile } = useWindowSize();

    return (
        <main className="h-screen overflow-hidden">
            <div className="flex h-full flex-col gap-4 p-4 bg-darknavy-900 text-gray-200">
                {/* Checking if the site should render the mobile version or the desktop version */}
                {!isMobile ? (
                        <PresetProvider>
                            <StackControlsProvider>
                                <PlayerHolderProvider>
                                    <FilterStateProvider>
                                        <div className="flex w-full flex-row justify-between">
                                            <CreateSideMenu />
                                            <PlayerTopMenu />
                                            <FilterSideMenu />
                                        </div>

                                        <Viewer />
                                    </FilterStateProvider>
                                </PlayerHolderProvider>
                            </StackControlsProvider>
                        </PresetProvider>
                    )
                    :
                    (
                        <FilterStateProvider>
                            <div className="flex flex-row justify-around mx-10">
                                {/* TODO: Implement some nice animation that rolls the icons to the right, transforming into the closing icon */}
                                <CreateSideMenuMobile />
                                <FilterSideMenuMobile />
                            </div>

                            <Viewer />
                        </FilterStateProvider>
                    )}
            </div>
        </main>
    );
}

export default MainApp;
