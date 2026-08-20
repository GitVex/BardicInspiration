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

/**
 * Both layouts mount the same provider stack and differ only in the chrome above the Viewer.
 *
 * Mobile used to skip PresetProvider/PlayerHolderProvider/StackControlsProvider entirely, which
 * made every ListItem's "Add" button a latent crash: it reaches for the preset through
 * useLoadVideoInLongestPausedPlayer, and those hooks returned an empty object instead of throwing.
 * On mobile no PlayerComponent ever registers a slot, so PlayerHolderProvider builds no iframes
 * and costs nothing - it just gives the Viewer a real, empty stack to look at.
 */
function MainApp() {
    const { isMobile } = useWindowSize();

    return (
        <main className="h-screen overflow-hidden">
            <div className="flex h-full flex-col gap-4 bg-darknavy-900 p-4 text-gray-200">
                <PresetProvider>
                    <PlayerHolderProvider>
                        <StackControlsProvider>
                            <FilterStateProvider>
                                {!isMobile ? (
                                    <div className="flex w-full flex-row justify-between">
                                        <CreateSideMenu />
                                        <PlayerTopMenu />
                                        <FilterSideMenu />
                                    </div>
                                ) : (
                                    <div className="mx-10 flex flex-row justify-around">
                                        {/* TODO: Implement some nice animation that rolls the icons to the right, transforming into the closing icon */}
                                        <CreateSideMenuMobile />
                                        <FilterSideMenuMobile />
                                    </div>
                                )}

                                <Viewer />
                            </FilterStateProvider>
                        </StackControlsProvider>
                    </PlayerHolderProvider>
                </PresetProvider>
            </div>
        </main>
    );
}

export default MainApp;
