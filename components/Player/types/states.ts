// ------------------- SELECTIONS REDUCER -------------------
import React from 'react';

/**
 * @typedef SelectionsState
 * @property {Array<{ id: number; selected: boolean }>} selected - An array of objects each containing an id and a selected status.
 */
export interface SelectionsState {
    selected: { id: number; selected: boolean }[];
}

/**
 * @typedef SelectionsAction
 * @property {'select' | 'deselect'} type - The type of action to be performed.
 * @property {number} index - The index of the selection.
 * @property {boolean} [selected] - The selected status.
 */
export interface SelectionsAction {
    type: 'select' | 'deselect';
    index: number;
    selected?: boolean;
}

/**
 * Reducer function for selections.
 * @param {SelectionsState} state - The current state.
 * @param {SelectionsAction} action - The action to be performed.
 * @returns {SelectionsState} - The new state.
 */
export const selectionsReducer = (state: SelectionsState, action: SelectionsAction): SelectionsState => {
    switch (action.type) {
        case 'select':
            console.log('selected player ' + action.index + '!', state);
            return {
                ...state,
                selected: state.selected.map(selection => {
                    if (selection.id === action.index) {
                        return { ...selection, selected: true };
                    } else {
                        return selection;
                    }
                }),
            };
        case 'deselect':
            console.log('deselected player ' + action.index + '!', state);
            return {
                ...state,
                selected: state.selected.map(selection => {
                    if (selection.id === action.index) {
                        return { ...selection, selected: false };
                    } else {
                        return selection;
                    }
                }),
            };
        default:
            throw new Error();
    }
};

// ------------------- VOLUMES REDUCER -------------------

/**
 * @typedef LocalVolumesState
 * @property {number[]} volume - An array of volume levels.
 */
export interface LocalVolumesState {
    volume: number[];
}

/**
 * @typedef LocalVolumesAction
 * @property {'setVolume'} type - The type of action to be performed.
 * @property {number} index - The index of the volume to be set.
 * @property {number} payload - The new volume level.
 */
export interface LocalVolumesAction {
    type: 'setVolume';
    index: number;
    payload: number;
}

/**
 * Reducer function for local volumes.
 * @param {LocalVolumesState} state - The current state.
 * @param {LocalVolumesAction} action - The action to be performed.
 * @returns {LocalVolumesState} - The new state.
 */
export const localVolumesReducer = (state: LocalVolumesState, action: LocalVolumesAction): LocalVolumesState => {
    switch (action.type) {
        case 'setVolume':
            return {
                ...state,
                volume: [
                    ...state.volume.slice(0, action.index), // Keep volumes before the updated one
                    action.payload, // Update the volume at the specified index
                    ...state.volume.slice(action.index + 1), // Keep volumes after the updated one
                ],
            };
        default:
            throw new Error();
    }
};

// ------------------- FADE INTERVALS REDUCER -------------------

/**
 * @typedef FadeIntervalsState
 * @property {(NodeJS.Timeout | null)[]} fadeIntervals - An array of fade intervals.
 */
export interface FadeIntervalsState {
    fadeIntervals: (NodeJS.Timeout | null)[];
}

/**
 * @typedef FadeIntervalsAction
 * @property {'setCurrentFadeInterval'} type - The type of action to be performed.
 * @property {number} index - The index of the fade interval to be set.
 * @property {NodeJS.Timeout | null} payload - The new fade interval.
 */
export interface FadeIntervalsAction {
    type: 'setCurrentFadeInterval';
    index: number;
    payload: NodeJS.Timeout | null;
}

/**
 * Reducer function for fade intervals.
 * @param {FadeIntervalsState} state - The current state.
 * @param {FadeIntervalsAction} action - The action to be performed.
 * @returns {FadeIntervalsState} - The new state.
 */
export const fadeIntervalsReducer = (state: FadeIntervalsState, action: FadeIntervalsAction): FadeIntervalsState => {
    switch (action.type) {
        case 'setCurrentFadeInterval':
            return {
                ...state,
                fadeIntervals: state.fadeIntervals.map((interval, index) => {
                    if (index === action.index) {
                        return action.payload;
                    } else {
                        return interval;
                    }
                }),
            };
        default:
            throw new Error();
    }
};

// ------------------- PAUSED TIMER REDUCER -------------------

/**
 * @typedef PausedTimerState
 * @property {number[]} pausedAt - An array of paused times.
 */
export interface PausedTimerState {
    pausedAt: number[];
}

/**
 * @typedef PausedTimerAction
 * @property {'setPausedAt'} type - The type of action to be performed.
 * @property {number} index - The index of the paused time to be set.
 * @property {number} payload - The new paused time.
 */
export interface PausedTimerAction {
    type: 'setPausedAt';
    index: number;
    payload: number;
}

/**
 * Reducer function for paused timers.
 * @param {PausedTimerState} state - The current state.
 * @param {PausedTimerAction} action - The action to be performed.
 * @returns {PausedTimerState} - The new state.
 */
export const pausedTimerReducer = (state: PausedTimerState, action: PausedTimerAction): PausedTimerState => {
    switch (action.type) {
        case 'setPausedAt':
            return {
                ...state,
                pausedAt: state.pausedAt.map((time, index) => {
                    if (index === action.index) {
                        return action.payload;
                    } else {
                        return time;
                    }
                }),
            };
        default:
            throw new Error();
    }
};

// ------------------- PLAYER URL REDUCER -------------------

/**
 * @typedef PlayerUrlState
 * @property {string[]} url - An array of URLs.
 */
export interface PlayerUrlState {
    url: string[];
}

/**
 * @typedef PlayerUrlAction
 * @property {'setUrl'} type - The type of action to be performed.
 * @property {number} index - The index of the URL to be set.
 * @property {string} payload - The new URL.
 */
export interface PlayerUrlAction {
    type: 'setUrl';
    index: number;
    payload: string;
}

/**
 * Reducer function for player URLs.
 * @param {PlayerUrlState} state - The current state.
 * @param {PlayerUrlAction} action - The action to be performed.
 * @returns {PlayerUrlState} - The new state.
 */
export const playerUrlReducer = (state: PlayerUrlState, action: PlayerUrlAction): PlayerUrlState => {
    switch (action.type) {
        case 'setUrl':
            return {
                ...state,
                url: state.url.map((url, index) => {
                    if (index === action.index) {
                        return action.payload;
                    } else {
                        return url;
                    }
                }),
            };
        default:
            throw new Error();
    }
};

// ------------------- CONTROL STATES -------------------

/**
 * @typedef localVolumesControlType
 * @property {number[]} localVolumes - An array of local volumes.
 * @property {React.Dispatch<LocalVolumesAction>} localVolumesDispatch - Dispatch function for local volumes.
 */
export interface localVolumesControlType {
    localVolumes: number[];
    localVolumesDispatch: React.Dispatch<LocalVolumesAction>;
}

/**
 * @typedef localVolumeControlType
 * @property {number} localVolume - The local volume.
 * @property {React.Dispatch<LocalVolumesAction>} localVolumeDispatch - Dispatch function for local volume.
 */
export interface localVolumeControlType {
    localVolume: number;
    localVolumeDispatch: React.Dispatch<LocalVolumesAction>;
}

/**
 * @typedef localVolumeControlEndType
 * @property {number} localVolume - The local volume.
 * @property {(vol: number) => void} setLocalVolume - Function to set the local volume.
 */
export interface localVolumeControlEndType {
    localVolume: number;
    setLocalVolume: (vol: number) => void;
}

/**
 * @typedef fadeIntervalsControlType
 * @property {(NodeJS.Timeout | null)[]} currentFadeIntervals - An array of current fade intervals.
 * @property {React.Dispatch<FadeIntervalsAction>} currentFadeIntervalDispatch - Dispatch function for current fade intervals.
 */
export interface fadeIntervalsControlType {
    currentFadeIntervals: (NodeJS.Timeout | null)[];
    currentFadeIntervalDispatch: React.Dispatch<FadeIntervalsAction>;
}

/**
 * @typedef fadeIntervalControlType
 * @property {NodeJS.Timeout | null} currentFadeInterval - The current fade interval.
 * @property {React.Dispatch<FadeIntervalsAction>} currentFadeIntervalDispatch - Dispatch function for current fade interval.
 */
export interface fadeIntervalControlType {
    currentFadeInterval: (NodeJS.Timeout | null);
    currentFadeIntervalDispatch: React.Dispatch<FadeIntervalsAction>;
}

/**
 * @typedef fadeIntervalControlEndType
 * @property {NodeJS.Timeout | null} currentFadeInterval - The current fade interval.
 * @property {(interval: (NodeJS.Timeout | null)) => void} setCurrentFadeInterval - Function to set the current fade interval.
 */
export interface fadeIntervalControlEndType {
    currentFadeInterval: (NodeJS.Timeout | null);
    setCurrentFadeInterval: (interval: (NodeJS.Timeout | null)) => void;
}