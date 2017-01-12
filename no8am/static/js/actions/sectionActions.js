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

export const highlightCourseTableSection = (courseGroupId, courseId, sectionId) => {
    return {
        type: 'HIGHLIGHT_COURSE_TABLE_SECTION',
        courseGroupId,
        courseId,
        sectionId
    }
};