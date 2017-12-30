import {getType} from "ts-redux-actions";

import {DataLoadingState} from "../Constants";
import {ISearchReducer} from "../Interfaces";
import {searchItem} from "../sections/SectionActions";
import * as SearchActions from "./SearchActions";

const initialState: ISearchReducer = {
    isSearchOmniboxOpen: false,
    metadata: [],
    searchHistory: [],
    status: DataLoadingState.LOADING,
};

export const search = (state = initialState, action: SearchActions.IActions): ISearchReducer => {

    switch (action.type) {
        case getType(SearchActions.receiveMetadata):
            return {
                ...state,
                metadata: action.metadata,
                status: DataLoadingState.LOADED,
            };

        case getType(SearchActions.errorReceivingMetadata):
            return {
                ...state,
                status: DataLoadingState.FAILED,
            };

        case getType(SearchActions.toggleSearchOmnibox):
            return {
                ...state,
                isSearchOmniboxOpen: !state.isSearchOmniboxOpen,
            };

        case getType(SearchActions.closeSearchOmnibox):
            return {
                ...state,
                isSearchOmniboxOpen: false,
            };

        case getType(SearchActions.openSearchOmnibox):
            return {
                ...state,
                isSearchOmniboxOpen: true,
            };

        case getType(searchItem):
            return {
                ...state,
                searchHistory: [action.item, ...state.searchHistory],
            };

        default:
            return state;
    }
};
