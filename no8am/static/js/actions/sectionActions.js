import {SECTION_DETAILS_URL} from '../Constants'

export const mouseEnterCalendarSection = (courseId) => {
    return {
        type: 'MOUSE_ENTER_CALENDAR_SECTION',
        courseId
    }
};

export const mouseLeaveCalendarSection = () => {
    return {
        type: 'MOUSE_LEAVE_CALENDAR_SECTION'
    };
};

export const mouseEnterCourseTableSection = (courseGroupId, courseId, sectionId) => {
    return {
        type: 'MOUSE_ENTER_COURSE_TABLE_SECTION',
        courseGroupId,
        courseId,
        sectionId
    }
};

export const mouseLeaveCourseTableSection = () => {
    return {
        type: 'MOUSE_LEAVE_COURSE_TABLE_SECTION'
    };
};

function requestSectionDetails(courseGroupId, courseId, sectionId) {
    return {
        type: 'HIGHLIGHT_COURSE_TABLE_SECTION_AND_REQUEST_SECTION_DETAILS',
        courseGroupId,
        courseId,
        sectionId
    }
}

function receiveSectionDetails(courseGroupId, courseId, sectionId, sectionDetails) {
    return {
        type: 'HIGHLIGHT_COURSE_TABLE_SECTION_AND_RECEIVE_SECTION_DETAILS',
        courseGroupId,
        courseId,
        sectionId,
        sectionDetails
    }
}

export function highlightCourseTableAndFetchSectionDetails(courseGroupId, courseId, sectionId, department, crn) {

    return function (dispatch) {

        // First dispatch: the app state is updated to inform
        // that the API call is starting.

        dispatch(requestSectionDetails(courseGroupId, courseId, sectionId));

        // The function called by the thunk middleware can return a value,
        // that is passed on as the return value of the dispatch method.

        // In this case, we return a promise to wait for.
        // This is not required by thunk middleware, but it is convenient for us.

        return fetch(`${SECTION_DETAILS_URL}?department=${department}&crn=${crn}`)
            .then(response => response.json())
            .then(sectionDetails => {
                    console.log(sectionDetails);

                    // We can dispatch many times!
                    // Here, we update the app state with the results of the API call.

                    dispatch(receiveSectionDetails(courseGroupId, courseId, sectionId, sectionDetails));
                }
            );

        // In a real world app, you also want to
        // catch any error in the network call.
    }
}

export const clickViewCourseTableButton = (buttonType, id) => {
    return {
        type: 'CLICK_VIEW_COURSE_TABLE_BUTTON',
        buttonType,
        id
    }
};
