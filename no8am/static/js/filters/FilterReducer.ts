import {getType} from "ts-redux-actions";

import {IFilterReducer} from "../Interfaces";
import * as FilterActions from "./FilterActions";

export const initialState: IFilterReducer = {
    filterTime: [0, 28],
    isAdvanced: false,
};

export const filters = (state = initialState, action: FilterActions.IActions) => {
    switch (action.type) {

        case getType(FilterActions.clickAdvancedSectionSelection):
            return {
                ...state,
                isAdvanced: !state.isAdvanced,
            };

        case getType(FilterActions.updateFilterTime):
            return {
                ...state,
                filterTime: action.filterTime,
            };

        default:
            return state;
    }
};
