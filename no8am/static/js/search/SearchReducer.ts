import {ActionType, getType} from "typesafe-actions";

import {DataLoadingState} from "../Constants";
import {ISearchReducer} from "../Interfaces";
import {searchItem} from "../sections/SectionActions";
import * as searchActions from "./SearchActions";

export type SilterActionType = ActionType<typeof searchActions> | ActionType<typeof searchItem>;

const initialState: ISearchReducer = {
    metadata: [],
    searchHistory: [],
    status: DataLoadingState.LOADING,
};

export const search = (state = initialState, action: SilterActionType): ISearchReducer => {

    switch (action.type) {
        case getType(searchActions.receiveMetadata):
            return {
                ...state,
                metadata: action.payload.metadata,
                status: DataLoadingState.LOADED,
            };

        case getType(searchActions.errorReceivingMetadata):
            return {
                ...state,
                status: DataLoadingState.FAILED,
            };

        case getType(searchItem):
            return {
                ...state,
                searchHistory: [action.payload.item, ...state.searchHistory],
            };

        default:
            return state;
    }
};
