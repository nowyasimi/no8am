import {EXTRA_SECTION_TYPES, SECTION_DETAILS_STATUS} from '../Constants'
import {initializeSections} from '../actions/SectionActions'

export const sectionReducer = (state = {courses:[], courseCounter: 1, isSearchOmniboxOpen: false}, action) => {
    switch (action.type) {
        case 'TOGGLE_SEARCH_OMNIBOX':
            return {
                ...state,
                isSearchOmniboxOpen: !state.isSearchOmniboxOpen
            };
        case 'CLOSE_SEARCH_OMNIBOX':
            return {
                ...state,
                isSearchOmniboxOpen: false
            };
        case 'OPEN_SEARCH_OMNIBOX':
            return {
                ...state,
                isSearchOmniboxOpen: true
            };
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
                    state: selectedSectionId == null ? SECTION_DETAILS_STATUS.NO_SELECTION : SECTION_DETAILS_STATUS.LOADING,
                    data: null
                }
            };
        case 'HIGHLIGHT_COURSE_TABLE_SECTION_AND_RECEIVE_SECTION_DETAILS':
            return {
                ...state,
                highlightCourseId: action.courseId,
                highlightSectionId: state.highlightSectionId,
                sectionDetails: {
                    state: SECTION_DETAILS_STATUS.LOADED,
                    data: action.sectionDetails
                }
            };
        case 'CLICK_VIEW_COURSE_TABLE_BUTTON':
            return {
                ...state,
                clickedCourseButtonId: action.courseId,
                highlightCourseId: action.courseId,
                highlightSectionId: state.courses.find((x) => x.courseId == action.courseId).selected,
                sectionDetails: {state: SECTION_DETAILS_STATUS.NO_SELECTION}
            };
        case 'CLOSE_SECTION_LIST_MODAL':
            return {
                ...state,
                highlightCourseId: null,
                highlightSectionId: null,
                clickedCourseButtonId: undefined,
                sectionDetails: {state: SECTION_DETAILS_STATUS.NO_SELECTION},
                courses: state.courses.map(x => {
                    let isParent = x.courseId === state.highlightCourseId;
                    let isDependent = x.parentCourseId === state.highlightCourseId && !x.isIndependent;
                    return isParent || isDependent ? {
                        ...x,
                        selected: isDependent ? null : state.highlightSectionId
                    } : x
                })
            };
        case 'REMOVE_COURSE':
            return {
                ...state,
                courses: state.courses.filter(course => !(course.courseId == action.courseId || course.parentCourseId == action.courseId))
            };
        case 'REQUEST_COURSE':
            return {
                ...state,
                courses: [
                    ...state.courses,
                    {
                        courseId: state.courseCounter,
                        department: action.department,
                        course: action.course,
                        color: 'blue',
                        dataStatus: 'loading',
                        isMain: true
                    }
                ],
                courseCounter: state.courseCounter + 1
            };
        case 'RECEIVE_COURSE':
            let courseId = state.courses.find(x => action.department && x.course === action.course && x.dataStatus === 'loading').courseId;

            return {
                ...state,
                courses: state.courses.map(x => x.courseId !== courseId ? x :
                        {
                            ...x,
                            sections: initializeSections(action.courseData.course.sections),
                            cacheTime: action.courseData.cache_time,
                            dataStatus: 'loaded'
                        }
                ).concat(
                    EXTRA_SECTION_TYPES
                        .filter(x => action.courseData.course.extraSectionsByType.hasOwnProperty(x))
                        .map(x => ({
                            color: 'red',
                            department: action.department,
                            course: action.course + x,
                            courseId: courseId + x,
                            sections: initializeSections(action.courseData.course.extraSectionsByType[x]),
                            isIndependent: action.courseData.course.isExtraSectionIndependent[x],
                            parentCourseId: courseId,
                            dataStatus: 'loaded'
                        }))
                )
            };
        default:
            return state
    }
};