import {getType} from "ts-redux-actions";

import {ICalendarReducer} from "../Interfaces";
import * as CalendarActions from "./CalendarActions";

const initialState: ICalendarReducer = {
    hoverCRN: null,
};

export const calendar = (state = initialState, action: CalendarActions.IActions): ICalendarReducer => {
    switch (action.type) {
        case getType(CalendarActions.mouseEnterCalendarSection):
            return {
                ...state,
                hoverCRN: action.CRN,
            };

        case getType(CalendarActions.mouseLeaveCalendarSection):
            return {
                ...state,
                hoverCRN: null,
            };

        default:
            return state;
    }
};
