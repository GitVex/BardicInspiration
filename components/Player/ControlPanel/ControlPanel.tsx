import { useState } from 'react';
import GroupFadeControl from './GroupFadeControl';
import InitialPlayerLoader from './InitialPlayerLoader';
import SelectionsViewer from './SelectionsViewer';
import FadeTransitionsToggle from './FadeTransitionsToggle';
import PersistenceControls from './PersistenceControls';

function ControlPanel() {
    const [initialLoadDone, setInitialLoadDone] = useState(false);
    const onLoaded = () => setInitialLoadDone(true);

    return (
        <div className="flex h-full w-1/3 min-h-0 shrink-0 flex-col items-center justify-center gap-2">
            <SelectionsViewer />
            <FadeTransitionsToggle />
            <GroupFadeControl initialLoadDone={initialLoadDone} />
            <PersistenceControls initialLoadDone={initialLoadDone} />
            {initialLoadDone ? null : (
                <InitialPlayerLoader
                    onLoaded={onLoaded}
                />
            )}
        </div>
    );
}

export default ControlPanel;
