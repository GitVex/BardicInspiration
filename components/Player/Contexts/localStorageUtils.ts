import { PresetState } from './states';

export const loadPreset = (initialPreset: PresetState): PresetState => {
    const savedState = localStorage.getItem('presetState');
    if (!savedState) return initialPreset;
    return JSON.parse(savedState);
};

export const savePreset = (state: PresetState): void => {
    localStorage.setItem('presetState', JSON.stringify(state));
};

export const clearPreset = (): void => {
    if (localStorage.getItem('presetState') === null) return;
    localStorage.removeItem('presetState');
};
