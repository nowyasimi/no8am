import {Dispatch} from "redux";
import {createAction} from "typesafe-actions";

import {SECTIONS_URL} from "../Constants";
import * as Interfaces from "../Interfaces";

export const receiveSections = createAction("RECEIVE_SECTIONS", (resolve) =>
    (sections: Interfaces.Section[]) => resolve({sections}));

export const errorReceivingSections = createAction("ERROR_RECEIVING_SECTIONS");

export const loadSections = () => {
    return (dispatch: Dispatch<Interfaces.IAllReducers>) => {
        return fetch(SECTIONS_URL)
            .then((response) => response.json(),
                  (error) => dispatch(errorReceivingSections()))
            .then((jsonResponse) => initializeSections(jsonResponse.sections))
            .then((sections: Interfaces.Section[]) => dispatch(receiveSections(sections)));
    };
};

export const mouseEnterSectionListCard = createAction("MOUSE_ENTER_SECTION_LIST_CARD", (resolve) =>
    (section: Interfaces.Section) => resolve({section}));

export const mouseLeaveSectionListCard = createAction("MOUSE_LEAVE_SECTION_LIST_CARD");

export const clickSectionListCard = createAction("CLICK_SECTION_LIST_CARD", (resolve) =>
    (section: Interfaces.Section, isManaged: boolean) => resolve({
        isManaged,
        section,
}));

export const clickCourseCard = createAction("CLICK_COURSE_CARD", (resolve) =>
    (clickedSearchItem: Interfaces.ISearchItem) => resolve({clickedSearchItem}));

export const goToManagedCard = createAction("GO_TO_MANAGED_CARD", (resolve) =>
    (abbreviation: string) => resolve({abbreviation}));

export const searchItem = createAction("SEARCH_ITEM", (resolve) =>
    (item: Interfaces.IMetadata) => resolve({item}));

export const clickDoneSelecting = createAction("CLICK_DONE_SELECTING");

export const revertToOriginAbbreviation = createAction("REVERT_TO_ORIGIN_ABBREVIATION");

export const searchAgainForAbbreviation = createAction("SEARCH_AGAIN_FOR_ABBREVIATION");

export const removeSearch = createAction("REMOVE_SEARCH");

const initializeSections = (sections: Interfaces.SectionUnparsed[]): Interfaces.Section[] => {
    return sections.map((section) => ({
        ...section,
        meetingTimes: parseTimesMet(restructureHours(section.timesMet)),
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

const parseTimesMet = (timesMet): Interfaces.IMeetingTime[] => {

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
