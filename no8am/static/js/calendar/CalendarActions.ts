import {createAction} from "typesafe-actions";

export const mouseEnterCalendarSection = createAction("MOUSE_ENTER_CALENDAR_SECTION", (resolve) =>
    (CRN: string) => resolve({CRN}));

export const mouseLeaveCalendarSection = createAction("MOUSE_LEAVE_CALENDAR_SECTION");
