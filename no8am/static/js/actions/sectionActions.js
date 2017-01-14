import {SECTION_DETAILS_URL, COURSE_LOOKUP_URL} from '../Constants'

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

export const clickViewCourseTableButton = (buttonType, id) => {
    return {
        type: 'CLICK_VIEW_COURSE_TABLE_BUTTON',
        buttonType,
        id
    }
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
            .then( jsonResponse => ({
                // TODO - also convert extra section lists
                // TODO - update API so this conversion is not necessary
                ...jsonResponse,
                sections: convertSectionsToArrayHelper(jsonResponse.sections)
            }))
            .then(courseData => dispatch(receiveCourse(department, course, courseData)))
            .catch(dispatch(errorReceivingCourse(department, course)));
    }
};

const convertSectionsToArrayHelper = (sections) => Object.keys(sections).map((key) => sections[key]);