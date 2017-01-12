
export function sectionReducer(state = {}, action) {
    // TODO - reset highlight state when modal is closed

    switch (action.type) {
        case 'MOUSE_ENTER_CALENDAR_SECTION':
            return {
                hoverCourseId: action.courseId
            };
        case 'MOUSE_LEAVE_CALENDAR_SECTION':
            return {};
        case 'MOUSE_ENTER_COURSE_TABLE_SECTION':
            return {
                courseTableHoverCourseGroupId: action.courseGroupId,
                courseTableHoverCourseId: action.courseId,
                courseTableHoverSectionId: action.sectionId,
                highlightCourseGroupId: state.highlightCourseGroupId,
                highlightCourseId: state.highlightCourseId,
                highlightSectionId: state.highlightSectionId
            };
        case 'MOUSE_LEAVE_COURSE_TABLE_SECTION':
            return {
                highlightCourseGroupId: state.highlightCourseGroupId,
                highlightCourseId: state.highlightCourseId,
                highlightSectionId: state.highlightSectionId
            };
        case 'HIGHLIGHT_COURSE_TABLE_SECTION':
            return {
                highlightCourseGroupId: action.courseGroupId,
                highlightCourseId: action.courseId,
                highlightSectionId: state.highlightSectionId == action.sectionId ? null : action.sectionId
            };
        default:
            return state
    }
}