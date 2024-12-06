import ControlPanelButton from './utils/ControlPanelButton';
import { useStackControls } from '../../Contexts/StackControlsProvider';

interface PersistenceControlsProps {
    initialLoadDone: boolean;
}

function PersistenceControls({ initialLoadDone }: PersistenceControlsProps) {

    const { disablePersistPreset, setDisablePersistPreset, clearPreset, savePersistPresetPref } = useStackControls();
    const disable = !initialLoadDone;

    const switchPersistPreset = () => {
        const prev = disablePersistPreset;

        setDisablePersistPreset(!prev);
        savePersistPresetPref(!prev);
    };

    const handleClearPersistPreset = () => {
        clearPreset();
    };

    return (
        <div>
            <div className="flex flex-row gap-2 rounded border-2 border-darknavy-700 bg-darknavy-500 p-2">
                <ControlPanelButton onClick={switchPersistPreset} disabled={disable}>
                    {disablePersistPreset ? 'Enable' : 'Disable'} Persistence
                </ControlPanelButton>

                <ControlPanelButton onClick={handleClearPersistPreset} disabled={disable}>
                    Clear Preset
                </ControlPanelButton>
            </div>
        </div>
    );
}

export default PersistenceControls;