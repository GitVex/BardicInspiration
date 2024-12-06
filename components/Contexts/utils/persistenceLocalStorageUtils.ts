// persistenceLocalStorageUtils.ts

export function loadPersistPresetPref(): boolean {
    const preference = localStorage.getItem('disablePersistPreset');
    return preference ? JSON.parse(preference) : false;
}

export function savePersistPresetPref(preference: boolean): void {
    console.log('set preference disablePersistPreset ', preference)
    localStorage.setItem('disablePersistPreset', JSON.stringify(preference));
}