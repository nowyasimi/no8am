import {ThunkAction} from "redux-thunk";
import {createAction} from "ts-redux-actions";

import {SECTIONS_URL} from "../Constants";
import {IMeetingTime, IMetadata, ISearchItem, Section, SectionUnparsed} from "../Interfaces";

import {getReturnOfExpression} from "react-redux-typescript";

export const receiveSections = createAction("RECEIVE_SECTIONS",
    (sections: Section[]) => ({
        sections,
        type: "RECEIVE_SECTIONS",
    }),
);

export const errorReceivingSections = createAction("ERROR_RECEIVING_SECTIONS",
    () => ({
        type: "ERROR_RECEIVING_SECTIONS",
    }),
);

export type ILoadSectionsThunk = ThunkAction<void, {}, {}>;

export const loadSections = (): ILoadSectionsThunk => {
    return (dispatch) => {
        return fetch(SECTIONS_URL)
            .then((response) => response.json(),
                  (error) => dispatch(errorReceivingSections()))
            .then((jsonResponse) => initializeSections(jsonResponse.sections))
            .then((sections: Section[]) => dispatch(receiveSections(sections)));
    };
};

export const mouseEnterSectionListCard = createAction("MOUSE_ENTER_SECTION_LIST_CARD",
    (section: Section) => ({
        section,
        type: "MOUSE_ENTER_SECTION_LIST_CARD",
    }),
);

export const mouseLeaveSectionListCard = createAction("MOUSE_LEAVE_SECTION_LIST_CARD",
    () => ({
        type: "MOUSE_LEAVE_SECTION_LIST_CARD",
    }),
);

export const clickSectionListCard = createAction("CLICK_SECTION_LIST_CARD",
    (section: Section, isManaged: boolean) => ({
        isManaged,
        section,
        type: "CLICK_SECTION_LIST_CARD",
    }),
);

export const clickCourseCard = createAction("CLICK_COURSE_CARD",
    (clickedSearchItem: ISearchItem) => ({
        clickedSearchItem,
        type: "CLICK_COURSE_CARD",
    }),
);

export const goToManagedCard = createAction("GO_TO_MANAGED_CARD",
    (abbreviation: string) => ({
        abbreviation,
        type: "GO_TO_MANAGED_CARD",
    }),
);

export const searchItem = createAction("SEARCH_ITEM",
    (item: IMetadata) => ({
        item,
        type: "SEARCH_ITEM",
    }),
);

export const clickDoneSelecting = createAction("CLICK_DONE_SELECTING",
    () => ({
        type: "CLICK_DONE_SELECTING",
    }),
);

export const revertToOriginAbbreviation = createAction("REVERT_TO_ORIGIN_ABBREVIATION",
    () => ({
        type: "REVERT_TO_ORIGIN_ABBREVIATION",
    }),
);

export const searchAgainForAbbreviation = createAction("SEARCH_AGAIN_FOR_ABBREVIATION",
    () => ({
        type: "SEARCH_AGAIN_FOR_ABBREVIATION",
    }),
);

export const removeSearch = createAction("REMOVE_SEARCH",
    () => ({
        type: "REMOVE_SEARCH",
    }),
);

const initializeSections = (sections: SectionUnparsed[]): Section[] => {
    return sections.map((section) => ({
        ...section,
        meetingTimes: parseTimesMet(restructureHours(section.timesMet)),
    }));
};

export const returnOfReceiveSections = getReturnOfExpression(receiveSections);
export const returnOfErrorReceivingSections = getReturnOfExpression(errorReceivingSections);
export const returnOfMouseEnterSectionListCard = getReturnOfExpression(mouseEnterSectionListCard);
export const returnOfMouseLeaveSectionListCard = getReturnOfExpression(mouseLeaveSectionListCard);
export const returnOfClickSectionListCard = getReturnOfExpression(clickSectionListCard);
export const returnOfClickCourseCard = getReturnOfExpression(clickCourseCard);
export const returnOfGoToManagedCard = getReturnOfExpression(goToManagedCard);
export const returnOfSearchItem = getReturnOfExpression(searchItem);
export const returnOfClickDoneSelecting = getReturnOfExpression(clickDoneSelecting);
export const returnOfRevertToOriginAbbreviation = getReturnOfExpression(revertToOriginAbbreviation);
export const returnOfSearchAgainForAbbreviation = getReturnOfExpression(searchAgainForAbbreviation);
export const returnOfRemoveSearch = getReturnOfExpression(removeSearch);

export type IActions =
    | typeof returnOfReceiveSections
    | typeof returnOfErrorReceivingSections
    | typeof returnOfMouseEnterSectionListCard
    | typeof returnOfMouseLeaveSectionListCard
    | typeof returnOfClickSectionListCard
    | typeof returnOfClickCourseCard
    | typeof returnOfGoToManagedCard
    | typeof returnOfSearchItem
    | typeof returnOfClickDoneSelecting
    | typeof returnOfRevertToOriginAbbreviation
    | typeof returnOfSearchAgainForAbbreviation
    | typeof returnOfRemoveSearch;

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

const parseTimesMet = (timesMet): IMeetingTime[] => {

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

        for (const day of days) {
            if (day === "S") {
                continue;
            }

            daysMet.push({
                day,
                duration: parsedEnd,
                endTimeUserFriendly: end.slice(0, -2),
                startTime: parsedStart,
                startTimeUserFriendly: start.slice(0, -2),
            });
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
