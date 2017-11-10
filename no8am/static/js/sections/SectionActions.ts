import {ThunkAction} from "redux-thunk";

import {SEARCH_ITEM_TYPE, SECTION_DETAILS_URL} from "../Constants";
import {IAllReducers, IMetadata, ISection, ISectionUnparsed} from "../Interfaces";
import {SearchActionType} from "../search/SearchActions";

export enum SectionActionType {
    RECEIVE_SECTIONS = "RECEIVE_SECTIONS",
    ERROR_RECEIVING_SECTIONS = "ERROR_RECEIVING_SECTIONS",
    MOUSE_ENTER_SECTION_LIST_CARD = "MOUSE_ENTER_SECTION_LIST_CARD",
    MOUSE_LEAVE_SECTION_LIST_CARD = "MOUSE_LEAVE_SECTION_LIST_CARD",
    CLICK_SECTION_LIST_CARD = "CLICK_SECTION_LIST_CARD",
    SEARCH_ITEM = "SEARCH_ITEM",
    CLICK_DONE_SELECTING = "CLICK_DONE_SELECTING",
    OTHER_ACTION = "__any_other_action_type__",
}

export type SectionActions =
    | IReceiveSections
    | IErrorReceivingSections
    | IMouseEnterSectionListCard
    | IMouseLeaveSectionListCard
    | IClickSectionListCard
    | ISearchItem
    | IClickDoneSelecting
    | IOtherAction;

interface IOtherAction {
    type: SectionActionType.OTHER_ACTION;
}

interface IReceiveSections {
    sections: ISection[];
    type: SectionActionType.RECEIVE_SECTIONS;
}

export const receiveSections = (sections: ISection[]): IReceiveSections => {
    return {
        sections,
        type: SectionActionType.RECEIVE_SECTIONS,
    };
};

interface IErrorReceivingSections {
    type: SectionActionType.ERROR_RECEIVING_SECTIONS;
}

export const errorReceivingSections = (): IErrorReceivingSections => {
    return {
        type: SectionActionType.ERROR_RECEIVING_SECTIONS,
    };
};

type ILoadSectionsThunk = ThunkAction<void, {}, {}>;

export const loadSections = (): ILoadSectionsThunk => {
    return (dispatch) => {
        return fetch(SECTIONS_URL)
            .then((response) => response.json())
            .then((jsonResponse) => initializeSections(jsonResponse.sections))
            .then((sections: ISection[]) => dispatch(receiveSections(sections)))
            .catch(dispatch(errorReceivingSections()));
    };
};

interface IMouseEnterSectionListCard {
    section: ISection;
    type: SectionActionType.MOUSE_ENTER_SECTION_LIST_CARD;
}

export const mouseEnterSectionListCard = (section: ISection): IMouseEnterSectionListCard => {
    return {
        section,
        type: SectionActionType.MOUSE_ENTER_SECTION_LIST_CARD,
    };
};

interface IMouseLeaveSectionListCard {
    type: SectionActionType.MOUSE_LEAVE_SECTION_LIST_CARD;
}

export const mouseLeaveSectionListCard = (): IMouseLeaveSectionListCard => {
    return {
        type: SectionActionType.MOUSE_LEAVE_SECTION_LIST_CARD,
    };
};

interface IClickSectionListCard {
    section: ISection;
    type: SectionActionType.CLICK_SECTION_LIST_CARD;
}

export const clickSectionListCard = (section: ISection): IClickSectionListCard => {
    return {
        section,
        type: SectionActionType.CLICK_SECTION_LIST_CARD,
    };
};

export interface ISearchItem {
    item: IMetadata;
    type: SectionActionType.SEARCH_ITEM | SearchActionType.SEARCH_ITEM;
}

export const searchItem = (item: IMetadata): ISearchItem => {
    return {
        item,
        type: SectionActionType.SEARCH_ITEM,
    };
};

interface IClickDoneSelecting {
    type: SectionActionType.CLICK_DONE_SELECTING;
}

export const clickDoneSelecting = () => {
    return {
        type: SectionActionType.CLICK_DONE_SELECTING,
    };
};

const initializeSections = (sections: ISectionUnparsed[]) => {
    return sections.map((section) => ({
        ...section,
        daysMet: parseTimesMet(restructureHours(section.timesMet)),
    }));
};

const restructureHours = (timesMet) => {

    let newTimesMet = [];
    for (let timeMet of timesMet) {

        let tempHours = timeMet.split(" ")[1];
        let startTime = tempHours.split("-")[0];
        let endTime = tempHours.split("-")[1];

        let cI1 = startTime.indexOf(":");
        let cI2 = endTime.indexOf(":");

        let startHour = parseInt(startTime.slice(0, cI1));
        let endHour = parseInt(endTime.slice(0, cI2));
        let amOrPm = endTime.slice(cI2 + 3);

        if (amOrPm == 'am' || (startHour != 12 && endHour == 12) || startHour > endHour) {
            newTimesMet.push(timeMet.split("-").join("am-"));
        }

        else {
            newTimesMet.push(timeMet.split("-").join("pm-"));
        }

    }
    return newTimesMet;
};

const parseTimesMet = (timesMet) => {

    const daysMet = [];

    for (const x of timesMet) {
        const dayAndTime = x.split(" ");
        const days = dayAndTime[0];
        const duration = dayAndTime[1];

        const time = duration.split("-");
        const start = time[0];
        const end = time[1];
        const parsedStart = parseHours(start);
        const parsedEnd = parseHours(end) - parsedStart;

        for (const day of days){
            if (day === "S") {
                continue;
            }
            daysMet.push([day, parsedStart, parsedEnd, start.slice(0, -2), end.slice(0, -2)]);
        }
    }

    return daysMet;
};

/**
 * Convert a time in the format (HH:MMam|pm).
 * @param time The time being converted (it can be either the start or end time for a section).
 * @return {number} Integer representing the number of 30 minute intervals past 8am for the provided time.
 */
function parseHours(time) {
    const splitHoursAndMinutes = time.split(":");
    let hour = parseInt(splitHoursAndMinutes[0]);
    const minutes = parseInt(splitHoursAndMinutes[1].slice(0, 2));
    const amOrPm = splitHoursAndMinutes[1].slice(2);

    if (amOrPm === "pm" && hour != 12) {
        hour += 12;
    }
    hour += -8 + minutes / 60;

    return hour * 2;
}
