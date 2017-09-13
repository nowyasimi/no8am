import {SECTION_DETAILS_URL, CCC_LOOKUP_URL, COURSE_LOOKUP_URL, CREDIT_LOOKUP_URL, SEARCH_ITEM_TYPE} from '../Constants'

interface IMetadataUnparsed {
    abbreviation: string,
    name: string,
    info?: string
}

export interface IMetadata extends IMetadataUnparsed {
    userFriendlyFormat: string,
    token: string,
    itemType: any
}

export const receiveMetadata = (metadata: IMetadata[]) => {
    return {
        type: 'RECEIVE_METADATA',
        metadata
    }
};

export const errorReceivingMetadata = () => {
    return {
        type: 'ERROR_RECEIVING_METADATA'
    }
};

export const loadMetadata = () => {
    return (dispatch) => {
        return fetch(METADATA_URL)
            .then(response => response.json())
            .then(rawMetadata => {
                let metadataList: IMetadata[] = [];

                for (const type of SEARCH_ITEM_TYPE.enumValues) {
                    if (type != SEARCH_ITEM_TYPE.HEADER) {
                        metadataList = metadataList.concat(rawMetadata[type.name.toLowerCase()].map((x: IMetadataUnparsed) => {
                            let userFriendlyFormat = `${x.abbreviation} - ${x.name}`;
                            return {
                                ...x,
                                itemType: type,
                                userFriendlyFormat: userFriendlyFormat,
                                token: userFriendlyFormat.toLowerCase()
                            };
                        }));
                    }
                }

                return ({loading: false, items: metadataList});
            })
            .then(metadata => dispatch(receiveMetadata(metadata)))
            .catch(dispatch(errorReceivingMetadata()));
    }
};

export const receiveSections = (sections) => {
    return {
        type: 'RECEIVE_SECTIONS',
        sections
    }
};

export const errorReceivingSections = () => {
    return {
        type: 'ERROR_RECEIVING_SECTIONS'
    }
};

export const loadSections = () => {
    return (dispatch) => {
        return fetch(SECTIONS_URL)
            .then(response => response.json())
            .then(jsonResponse => initializeSections(jsonResponse.sections))
            .then(sections => dispatch(receiveSections(sections)))
            .catch(dispatch(errorReceivingSections()));
    }
};

export const toggleSearchOmnibox = () => {
    return {
        type: 'TOGGLE_SEARCH_OMNIBOX'
    }
};

export const closeSearchOmnibox = () => {
    return {
        type: 'CLOSE_SEARCH_OMNIBOX'
    }
};

export const openSearchOmnibox = () => {
    return {
        type: 'OPEN_SEARCH_OMNIBOX'
    }
};

export const requestItem = (item) => {
    return {
        type: 'REQUEST_ITEM',
        item
    }
};

export const receiveItem = (item, data) => {
    return {
        type: 'RECEIVE_ITEM',
        item,
        data
    }
};

export const searchItem = (item, isFromCategorySearch = false) => {
    return {
        type: 'SEARCH_ITEM',
        item,
        isFromCategorySearch
    };
};

export const mouseEnterSectionListCard = (section) => {
    return {
        type: 'MOUSE_ENTER_SECTION_LIST_CARD',
        section
    }
};

export const mouseLeaveSectionListCard = () => {
    return {
        type: 'MOUSE_LEAVE_SECTION_LIST_CARD'
    }
};

export const clickSectionListCard = (section) => {
    return (dispatch) => {
        dispatch({
            type: 'CLICK_SECTION_LIST_CARD',
            section
        });

        if (section.isFromCategorySearch) {
            let item: IMetadata = {
                itemType: SEARCH_ITEM_TYPE.Course,
                abbreviation: section.departmentAndBareCourse,
                name: section.courseName,
                userFriendlyFormat: `${section.departmentAndBareCourse} - ${section.courseName}`,
                token: null
            };

            dispatch(searchItem(item, true));
        }
    };
};

export const clickShowSingleCourse = (section) => {
    return {
        type: 'CLICK_SHOW_SINGLE_COURSE',
        departmentAndBareCourse: section.departmentAndBareCourse
    };
};

export const updateFilterTime = (filterTime) => {
    return {
        type: 'UPDATE_FILTER_TIME',
        filterTime
    }
};

export const clickRemoveShowSingleCourse = () => {
    return {
        type: 'CLICK_REMOVE_SHOW_SINGLE_COURSE'
    }
};

export const clickAdvancedSectionSelection = () => {
    return {
        type: 'CLICK_ADVANCED_SECTION_SELECTION'
    }
};

export const clickDoneSelecting = () => {
    return {
        type: 'CLICK_DONE_SELECTING'
    }
};

export const mouseEnterCalendarSection = (crn) => {
    return {
        type: 'MOUSE_ENTER_CALENDAR_SECTION',
        crn
    }
};

export const mouseLeaveCalendarSection = () => {
    return {
        type: 'MOUSE_LEAVE_CALENDAR_SECTION'
    };
};

export const mouseEnterCourseTableSection = (courseId, sectionId) => {
    return {
        type: 'MOUSE_ENTER_COURSE_TABLE_SECTION',
        courseId,
        sectionId
    }
};

export const mouseLeaveCourseTableSection = () => {
    return {
        type: 'MOUSE_LEAVE_COURSE_TABLE_SECTION'
    };
};

const requestSectionDetails = (courseId, sectionId) => {
    return {
        type: 'HIGHLIGHT_COURSE_TABLE_SECTION_AND_REQUEST_SECTION_DETAILS',
        courseId,
        sectionId
    }
};

const receiveSectionDetails = (courseId, sectionId, sectionDetails) => {
    return {
        type: 'HIGHLIGHT_COURSE_TABLE_SECTION_AND_RECEIVE_SECTION_DETAILS',
        courseId,
        sectionId,
        sectionDetails
    }
};

export const highlightCourseTableAndFetchSectionDetails = (courseId, sectionId, department, crn) => {
     return (dispatch) => {
         dispatch(requestSectionDetails(courseId, sectionId));

         return fetch(`${SECTION_DETAILS_URL}?department=${department}&crn=${crn}`)
             .then(response => response.json())
             .then(sectionDetails => dispatch(receiveSectionDetails(courseId, sectionId, sectionDetails)));
     }
};

export const clickViewCourseTableButton = (courseId) => {
    return {
        type: 'CLICK_VIEW_COURSE_TABLE_BUTTON',
        courseId
    }
};

export const closeSectionListModal = () => {
    return {
        type: 'CLOSE_SECTION_LIST_MODAL'
    };
};

export const clickRemoveCourseButton = (courseId) => {
    return {
        type: 'REMOVE_COURSE',
        courseId
    };
};

export const requestCourse = (department, course) => {
    return {
        type: 'REQUEST_COURSE',
        department,
        course
    }
};

export const receiveCourse = (department, course, courseData) => {
    return {
        type: 'RECEIVE_COURSE',
        department,
        course,
        courseData
    }
};

export const errorReceivingCourse = (department, course) => {
    return {
        type: 'ERROR_RECEIVING_COURSE',
        department,
        course
    }
};

export const fetchNewCourse = (department, course) => {
    return (dispatch) => {
        dispatch(requestCourse(department, course));
        return fetch(`${COURSE_LOOKUP_URL}${department}/${course}`)
            .then(response => response.json())
            .then(jsonResponse => ({
                ...jsonResponse,
                selected: null
            }))
            .then(courseData => dispatch(receiveCourse(department, course, courseData)))
            .catch(dispatch(errorReceivingCourse(department, course)));
    }
};


const initializeSections = (sections) => {
    return sections.map(section => ({
        ...section,
        daysMet: parseTimesMet(restructureHours(section.timesMet))
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

    let daysMet = [];

    for (let x of timesMet) {
        let dayAndTime = x.split(" ");
        let days = dayAndTime[0];
        let duration = dayAndTime[1];

        let time = duration.split("-");
        let start = time[0];
        let end = time[1];
        let parsedStart = parseHours(start);
        let parsedEnd = parseHours(end) - parsedStart;

        for (let day of days){
            if (day === "S") {
                continue;
            }
            daysMet.push( [day, parsedStart, parsedEnd, start.slice(0,-2), end.slice(0,-2)] );
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
    let splitHoursAndMinutes = time.split(":");
    let hour = parseInt(splitHoursAndMinutes[0]);
    let minutes = parseInt(splitHoursAndMinutes[1].slice(0,2));
    let amOrPm = splitHoursAndMinutes[1].slice(2);

    if (amOrPm == "pm" && hour != 12) {
        hour += 12;
    }
    hour += -8 + minutes/60;

    return hour*2;
}