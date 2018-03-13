import {createAction} from "ts-redux-actions";

import {getReturnOfExpression} from "react-redux-typescript";

export const clickAdvancedSectionSelection = createAction("CLICK_ADVANCED_SECTION_SELECTION",
    () => ({
        type: "CLICK_ADVANCED_SECTION_SELECTION",
    }),
);

export const updateFilterTime = createAction("UPDATE_FILTER_TIME",
    (filterTime) => ({
        filterTime,
        type: "UPDATE_FILTER_TIME",
    }),
);

export const updateFilterCCC = createAction("UPDATE_FILTER_CCC",
    (filterCCC) => ({
        filterCCC,
        type: "UPDATE_FILTER_CCC",
    }),
);

export const returnOfClickAdvancedSectionSelection = getReturnOfExpression(clickAdvancedSectionSelection);
export const returnOfUpdateFilterTime = getReturnOfExpression(updateFilterTime);
export const returnOfUpdateFilterCCC = getReturnOfExpression(updateFilterCCC);

export type IActions =
    | typeof returnOfClickAdvancedSectionSelection
    | typeof returnOfUpdateFilterTime
    | typeof returnOfUpdateFilterCCC;
