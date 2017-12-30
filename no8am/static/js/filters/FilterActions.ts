import {createAction} from "ts-redux-actions";

import {getReturnOfExpression} from "react-redux-typescript";

import {CCC_LOOKUP_URL, COURSE_LOOKUP_URL, CREDIT_LOOKUP_URL} from "../Constants";
import {IMetadata, IMetadataUnparsed, ISection, ISectionUnparsed} from "../Interfaces";

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

export const returnOfClickAdvancedSectionSelection = getReturnOfExpression(clickAdvancedSectionSelection);
export const returnOfUpdateFilterTime = getReturnOfExpression(updateFilterTime);

export type IActions =
    | typeof returnOfClickAdvancedSectionSelection
    | typeof returnOfUpdateFilterTime;
