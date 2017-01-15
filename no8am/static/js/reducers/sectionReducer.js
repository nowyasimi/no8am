export const sectionReducer = (state = {courses:[], courseCounter: 1}, action) => {
    // TODO - reset highlight state when modal is closed

    switch (action.type) {
        case 'MOUSE_ENTER_CALENDAR_SECTION':
            return {
                ...state,
                hoverCourseId: action.courseId
            };
        case 'MOUSE_LEAVE_CALENDAR_SECTION':
            return {
                ...state,
                hoverCourseId: undefined
            };
        case 'MOUSE_ENTER_COURSE_TABLE_SECTION':
            return {
                ...state,
                courseTableHoverCourseId: action.courseId,
                courseTableHoverSectionId: action.sectionId
            };
        case 'MOUSE_LEAVE_COURSE_TABLE_SECTION':
            return {
                ...state,
                courseTableHoverCourseId: undefined,
                courseTableHoverSectionId: undefined
            };
        case 'HIGHLIGHT_COURSE_TABLE_SECTION_AND_REQUEST_SECTION_DETAILS':
            let selectedSectionId = state.highlightSectionId == action.sectionId ? null : action.sectionId;
            return {
                ...state,
                highlightCourseId: action.courseId,
                highlightSectionId: selectedSectionId,
                sectionDetails: {
                    state: "loading",
                    data: null
                },
                courses: state.courses.map((x) => x.courseId === action.courseId ? {
                        ...x,
                        selected: selectedSectionId
                    } : x
                )
            };
        case 'HIGHLIGHT_COURSE_TABLE_SECTION_AND_RECEIVE_SECTION_DETAILS':
            return {
                ...state,
                highlightCourseId: action.courseId,
                highlightSectionId: state.highlightSectionId,
                sectionDetails: {
                    state: "loaded",
                    data: action.sectionDetails
                }
            };
        case 'CLICK_VIEW_COURSE_TABLE_BUTTON':
            return {
                ...state,
                clickedCourseButtonId: action.id,
                highlightCourseId: action.id,
                highlightSectionId: state.courses.find((x) => x.courseId == action.id).selected
            };
        case 'CLOSE_SECTION_LIST_MODAL':
            return {
                ...state,
                highlightCourseId: null,
                highlightSectionId: selectedSectionId,
                sectionDetails: undefined,
                clickedCourseButtonId: undefined
            };
        case 'REQUEST_COURSE':
            return {
                ...state,
                courses: [
                    ...state.courses,
                    {
                        courseId: state.courseCounter + 1,
                        department: action.department,
                        course: action.course,
                        color: 'blue',
                        dataStatus: 'loading'
                    }
                ],
                courseCounter: state.courseCounter + 1
            };
        case 'RECEIVE_COURSE':
            return {
                ...state,
                courses: state.courses.map((x) =>
                    action.department && x.course === action.course && x.dataStatus === 'loading' ?
                        {
                            ...x,
                            sections:
                            action.courseData.sections,
                            cacheTime: action.courseData.cache_time,
                            dataStatus: 'loaded'
                        } : x
                )
            };
        default:
            return state
    }
};