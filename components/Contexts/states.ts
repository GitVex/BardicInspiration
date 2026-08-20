import IFPlayer from '../Player/types/IFPlayer';

// ------------------- PLAYER HOLDER REDUCER -------------------

/** One slot in the stack: the YouTube player built into it, and whether it has reported ready. */
export interface PlayerHolder {
    id: number;
    player: IFPlayer | null;
    isReady: boolean;
}

export interface PlayerHolderState {
    holders: PlayerHolder[];
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

/** Replaces one holder, leaving its siblings' identities untouched. */
function updateHolderAtIndex(
    holders: PlayerHolder[],
    index: number,
    update: Partial<PlayerHolder>,
): PlayerHolder[] {
    if (!Number.isInteger(index) || index < 0 || index >= holders.length) {
        console.error(`Invalid index ${index} for holders array of length ${holders.length}`);
        return holders;
    }

    return [
        ...holders.slice(0, index),
        { ...holders[index], ...update },
        ...holders.slice(index + 1),
    ];
}

export const playerHolderReducer = (state: PlayerHolderState, action: PlayerHolderAction): PlayerHolderState => {
    switch (action.type) {
        case 'setPlayer':
            return {
                ...state,
                holders: updateHolderAtIndex(state.holders, action.index, { player: action.payload }),
            };
        case 'setReady':
            return {
                ...state,
                holders: updateHolderAtIndex(state.holders, action.index, { isReady: true }),
            };
        case 'init':
            return action.payload;
        case 'setFirstLoadDone':
            return {
                ...state,
                firstLoadDone: true,
            };
        default:
            throw new Error(`Unhandled action type: ${(action as PlayerHolderAction).type}`);
    }
};
