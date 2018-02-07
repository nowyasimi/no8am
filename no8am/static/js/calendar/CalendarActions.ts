import {getReturnOfExpression} from "react-redux-typescript";
import {createAction} from "ts-redux-actions";

export const mouseEnterCalendarSection = createAction("MOUSE_ENTER_CALENDAR_SECTION",
    (CRN: string) => ({
        CRN,
        type: "MOUSE_ENTER_CALENDAR_SECTION",
    }),
);

export const mouseLeaveCalendarSection = createAction("MOUSE_LEAVE_CALENDAR_SECTION",
    () => ({
        type: "MOUSE_LEAVE_CALENDAR_SECTION",
    }),
);

export const returnOfMouseEnterCalendarSection = getReturnOfExpression(mouseEnterCalendarSection);
export const returnOfMouseLeaveCalendarSection = getReturnOfExpression(mouseLeaveCalendarSection);

export type IActions =
    | typeof returnOfMouseEnterCalendarSection
    | typeof returnOfMouseLeaveCalendarSection;
