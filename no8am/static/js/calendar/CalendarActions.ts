import {IMetadata, IMetadataUnparsed, ISection, ISectionUnparsed} from "../Interfaces";

export enum CalendarActionType {
    MOUSE_ENTER_CALENDAR_SECTION = "MOUSE_ENTER_CALENDAR_SECTION",
    MOUSE_LEAVE_CALENDAR_SECTION = "MOUSE_LEAVE_CALENDAR_SECTION",
    OTHER_ACTION = "__any_other_action_type__",
}

export type CalendarActions =
    | IMouseEnterCalendarSection
    | IMouseLeaveCalendarSection
    | IOtherAction;

interface IOtherAction {
    type: CalendarActionType.OTHER_ACTION;
}

interface IMouseEnterCalendarSection {
    type: CalendarActionType.MOUSE_ENTER_CALENDAR_SECTION;
    CRN: string;
}

export const mouseEnterCalendarSection = (CRN: string) => {
    return {
        CRN,
        type: CalendarActionType.MOUSE_ENTER_CALENDAR_SECTION,
    };
};

interface IMouseLeaveCalendarSection {
    type: CalendarActionType.MOUSE_LEAVE_CALENDAR_SECTION;
}

export const mouseLeaveCalendarSection = () => {
    return {
        type: CalendarActionType.MOUSE_LEAVE_CALENDAR_SECTION,
    };
};
