import {ActionType, getType} from "typesafe-actions";

import {ICalendarReducer} from "../Interfaces";
import * as calendarActions from "./CalendarActions";

export type CalendarActionType = ActionType<typeof calendarActions>;

const initialState: ICalendarReducer = {
    hoverCRN: null,
};

export const calendar = (state = initialState, action: CalendarActionType): ICalendarReducer => {
    switch (action.type) {
        case getType(calendarActions.mouseEnterCalendarSection):
            return {
                ...state,
                hoverCRN: action.payload.CRN,
            };

        case getType(calendarActions.mouseLeaveCalendarSection):
            return {
                ...state,
                hoverCRN: null,
            };

        default:
            return state;
    }
};
