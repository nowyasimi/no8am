import {ActionType, getType} from "typesafe-actions";

import {IFilterReducer} from "../Interfaces";
import * as filterActions from "./FilterActions";

export type FilterActionType = ActionType<typeof filterActions>;

export const initialState: IFilterReducer = {
    filterCCCs: [],
    filterTime: [0, 28],
    isAdvanced: false,
};

export const filters = (state = initialState, action: FilterActionType) => {
    switch (action.type) {

        case getType(filterActions.clickAdvancedSectionSelection):
            return {
                ...state,
                isAdvanced: !state.isAdvanced,
            };

        case getType(filterActions.updateFilterTime):
            return {
                ...state,
                filterTime: action.payload.filterTime,
            };

        case getType(filterActions.updateFilterCCC):
            return {
                ...state,
                filterCCCs: action.payload.filterCCC,
            };

        default:
            return state;
    }
};
