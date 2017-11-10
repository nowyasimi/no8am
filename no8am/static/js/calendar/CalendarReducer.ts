import {SEARCH_ITEM_TYPE} from "../Constants";
import {ICalendarReducer} from "../Interfaces";

import {CalendarActions, CalendarActionType} from "./CalendarActions";

const initialState: ICalendarReducer = {
    hoverCRN: null,
};

export const calendar = (state: ICalendarReducer = initialState, action: CalendarActions): ICalendarReducer => {
    switch (action.type) {
        case CalendarActionType.MOUSE_ENTER_CALENDAR_SECTION:
            return {
                ...state,
                hoverCRN: action.CRN,
            };

        case CalendarActionType.MOUSE_LEAVE_CALENDAR_SECTION:
            return {
                ...state,
                hoverCRN: null,
            };

        default:
            return state;
    }
};
