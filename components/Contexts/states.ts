import IFPlayer from '../Player/types/IFPlayer';

// ------------------- PLAYER STATE REDUCER -------------------

export interface PresetState {
    title: string;
    players: PlayerState[];
    masterVolume: number;
}

export interface PlayerState {
    id: number;
    selected: boolean;
    volume: number;
    savedVolume: { hasSaved: boolean; prevVol: number };
    pausedAt: number;
    videoId: string;
}

export type PlayerStateAction =
    | VolumeAction
    | SetPausedAtAction
    | SetIdAction
    | SelectAction
    | SetTitleAction
    | SetPresetAction;

type VolumeAction = SetVolumeAction | SetSavedVolumeAction | SetMasterVolumeAction;

interface SetVolumeAction {
    type: 'setVolume';
    index: number;
    payload: number;
}

interface SetSavedVolumeAction {
    type: 'setSavedVolume';
    index: number;
    payload: { hasSaved: boolean; prevVol: number };
}

interface SetMasterVolumeAction {
    type: 'setMasterVolume';
    payload: number;
}

interface SetPausedAtAction {
    type: 'setPausedAt';
    index: number;
    payload: number;
}

interface SetIdAction {
    type: 'setId';
    index: number;
    payload: string;
}

interface SetTitleAction {
    type: 'setTitle';
    payload: string;
}

interface SelectAction {
    type: 'select' | 'deselect';
    index: number;
}

interface SetPresetAction {
    type: 'setPreset';
    payload: PresetState;
}

export const playerStateReducer = (state: PresetState, action: PlayerStateAction): PresetState => {
    function updatePlayerAtIndex(players: PlayerState[], index: number, update: Partial<PlayerState>): PlayerState[] {
        return [
            ...players.slice(0, index), // Keep players before the updated one
            { ...players[index], ...update }, // Update the player at the specified index
            ...players.slice(index + 1), // Keep players after the updated one
        ];
    }

    switch (action.type) {
        case 'setPreset':
            return action.payload;
        case 'setTitle':
            return {
                ...state,
                title: action.payload,
            };
        case 'setVolume':
            return {
                ...state,
                players: updatePlayerAtIndex(state.players, action.index, { volume: action.payload }),
            };
        case 'setSavedVolume':
            return {
                ...state,
                players: updatePlayerAtIndex(state.players, action.index, { savedVolume: action.payload }),
            };
        case 'setPausedAt':
            return {
                ...state,
                players: updatePlayerAtIndex(state.players, action.index, { pausedAt: action.payload }),
            };
        case 'setId':
            return {
                ...state,
                players: updatePlayerAtIndex(state.players, action.index, { videoId: action.payload }),
            };
        case 'select':
            return {
                ...state,
                players: updatePlayerAtIndex(state.players, action.index, { selected: true }),
            };
        case 'deselect':
            return {
                ...state,
                players: updatePlayerAtIndex(state.players, action.index, { selected: false }),
            };
        case 'setMasterVolume':
            return {
                ...state,
                masterVolume: action.payload,
            };
        default:
            throw new Error();
    }
};

// ------------------- PLAYER HOLDER REDUCER -------------------

export interface PlayerHolderState {
    holders: {
        player: IFPlayer | null;
        isReady: boolean
    }[],
    firstLoadDone: boolean;
}

export type PlayerHolderAction = SetPlayerAction | SetReadyAction | InitHolderAction | SetFirstLoadDoneAction;

interface InitHolderAction {
    type: 'init';
    payload: PlayerHolderState;
}

interface SetPlayerAction {
    index: number;
    type: 'setPlayer';
    payload: IFPlayer;
}

interface SetReadyAction {
    index: number;
    type: 'setReady';
}

interface SetFirstLoadDoneAction {
    type: 'setFirstLoadDone';
}

export const playerHolderReducer = (state: PlayerHolderState, action: PlayerHolderAction): PlayerHolderState => {
    switch (action.type) {
        case 'setPlayer':
            return {
                ...state,
                holders: [
                    ...state.holders.slice(0, action.index), // Keep holders before the updated one
                    { player: action.payload, isReady: state.holders[action.index].isReady }, // Update the holder at the specified index
                    ...state.holders.slice(action.index + 1), // Keep holders after the updated one
                ],
            };
        case 'setReady':
            return {
                ...state,
                holders: [
                    ...state.holders.slice(0, action.index), // Keep holders before the updated one
                    { player: state.holders[action.index].player, isReady: true }, // Update the holder at the specified index
                    ...state.holders.slice(action.index + 1), // Keep holders after the updated one
                ],
            };
        case 'init':
            return action.payload;
        case 'setFirstLoadDone':
            return {
                ...state,
                firstLoadDone: true,
            };
        default:
            throw new Error();
    }
};