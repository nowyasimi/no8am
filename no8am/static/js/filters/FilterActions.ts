import {createAction} from "typesafe-actions";

export const clickAdvancedSectionSelection = createAction("CLICK_ADVANCED_SECTION_SELECTION");

export const updateFilterTime = createAction("UPDATE_FILTER_TIME", (resolve) =>
    (filterTime: [number, number]) => resolve({filterTime}));

export const updateFilterCCC = createAction("UPDATE_FILTER_CCC", (resolve) =>
    (filterCCC: string) => resolve({filterCCC}));
