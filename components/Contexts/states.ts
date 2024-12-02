import IFPlayer from '../Player/types/IFPlayer';

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