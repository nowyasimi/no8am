
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
                highlightSectionId: state.highlightSectionId,
                sectionDetails: state.sectionDetails
            };
        case 'MOUSE_LEAVE_COURSE_TABLE_SECTION':
            return {
                highlightCourseGroupId: state.highlightCourseGroupId,
                highlightCourseId: state.highlightCourseId,
                highlightSectionId: state.highlightSectionId,
                sectionDetails: state.sectionDetails
            };
        case 'HIGHLIGHT_COURSE_TABLE_SECTION_AND_REQUEST_SECTION_DETAILS':
            return {
                highlightCourseGroupId: action.courseGroupId,
                highlightCourseId: action.courseId,
                highlightSectionId: state.highlightSectionId == action.sectionId ? null : action.sectionId,
                sectionDetails: {
                    state: "loading",
                    data: null
                }
            };
        case 'HIGHLIGHT_COURSE_TABLE_SECTION_AND_RECEIVE_SECTION_DETAILS':
            return {
                highlightCourseGroupId: action.courseGroupId,
                highlightCourseId: action.courseId,
                highlightSectionId: state.highlightSectionId,
                sectionDetails: {
                    state: "loaded",
                    data: action.sectionDetails
                }
            };
        case 'CLICK_VIEW_COURSE_TABLE_BUTTON':
            return {
                lastClickedViewSectionsButton: {
                    type: action.buttonType,
                    id: action.id
                }
            };
        default:
            return state
    }
}