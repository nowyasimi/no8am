import {DataLoadingState} from "../Constants";
import {ISearchReducer} from "../Interfaces";
import {SearchActions, SearchActionType} from "./SearchActions";

const initialState: ISearchReducer = {
    isSearchOmniboxOpen: false,
    metadata: [],
    searchHistory: [],
    status: DataLoadingState.LOADING,
};

export const search = (state: ISearchReducer = initialState, action: SearchActions): ISearchReducer => {
    switch (action.type) {
        case SearchActionType.RECEIVE_METADATA:
            return {
                ...state,
                metadata: action.metadata,
            };

        case SearchActionType.TOGGLE_SEARCH_OMNIBOX:
            return {
                ...state,
                isSearchOmniboxOpen: !state.isSearchOmniboxOpen,
            };

        case SearchActionType.CLOSE_SEARCH_OMNIBOX:
            return {
                ...state,
                isSearchOmniboxOpen: false,
            };

        case SearchActionType.OPEN_SEARCH_OMNIBOX:
            return {
                ...state,
                isSearchOmniboxOpen: true,
            };

        case SearchActionType.SEARCH_ITEM:
            return {
                ...state,
                searchHistory: [action.item, ...state.searchHistory],
            };

        default:
            return state;
    }
};
