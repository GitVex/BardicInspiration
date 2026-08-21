import { useState } from 'react';
import GroupFadeControl from './GroupFadeControl';
import InitialPlayerLoader from './InitialPlayerLoader';
import SelectionsViewer from './SelectionsViewer';
import PersistenceControls from './PersistenceControls';
import FadeTransitionsToggle from './FadeTransitionsToggle';

/**
 * Stack-wide controls, ordered by how often they are touched.
 *
 * The selection list and the group actions it drives sit together at the top; settings and
 * persistence are pushed to the bottom, where they stay out of the way of anything used during a
 * session. w-1/4 rather than w-1/3 because the panel was previously 416px wide for 364px of
 * content, while the player grid next to it was the thing actually short of room.
 */
function ControlPanel() {
    const [initialLoadDone, setInitialLoadDone] = useState(false);
    const onLoaded = () => setInitialLoadDone(true);

    return (
        <div className="flex h-full w-1/4 min-h-0 shrink-0 flex-col items-stretch gap-3 p-1">
            <SelectionsViewer />
            <GroupFadeControl initialLoadDone={initialLoadDone} />

            <div className="mt-auto flex flex-col gap-2 border-t border-darknavy-700/60 pt-3">
                <FadeTransitionsToggle />
                <PersistenceControls initialLoadDone={initialLoadDone} />
            </div>

            {initialLoadDone ? null : (
                <InitialPlayerLoader
                    onLoaded={onLoaded}
                />
            )}
        </div>
    );
}

export default ControlPanel;
