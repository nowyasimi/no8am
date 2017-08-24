import {DATA_LOADING_STATE} from '../Constants'

const initialState = {
    courses:[],
    courseCounter: 1,
    isSearchOmniboxOpen: false,
    searchHistory: [],
    currentSearch: {
        item: null,
        state: DATA_LOADING_STATE.NO_SELECTION
    },
    selectedSections: []
};


export const sectionReducer = (state = initialState, action) => {
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
        case 'REQUEST_ITEM':
            return {
                ...state,
                searchHistory:  [action.item, ...state.searchHistory],
                currentSearch: {
                    item: action.item,
                    state: DATA_LOADING_STATE.LOADING
                }
            };
        case 'RECEIVE_ITEM':
            return {
                ...state,
                currentSearch: state.currentSearch.item.token != action.item.token ? state.currentSearch : {
                    ...state.currentSearch,
                    state: DATA_LOADING_STATE.LOADED,
                    data: action.data
                }
            };
        case 'CLICK_DONE_SELECTING':
            return {
                ...state,
                currentSearch: {
                    item: null,
                    state: DATA_LOADING_STATE.NO_SELECTION
                }
            };
        case 'MOUSE_ENTER_SECTION_LIST_CARD':
            return {
                ...state,
                sectionListHoverSection: action.section
            };
        case 'MOUSE_LEAVE_SECTION_LIST_CARD':
            return {
                ...state,
                sectionListHoverSection: null
            };
        case 'CLICK_SECTION_LIST_CARD':
            let isReset = state.selectedSections.find(section => section.CRN == action.section.CRN);

            let filteredSections = state.selectedSections.filter(section =>
                section.department != action.section.department ||
                section.course_number != action.section.course_number
            );

            return {
                ...state,
                selectedSections: isReset ? filteredSections : [
                    ...filteredSections,
                    action.section
                ]
            };
        case 'MOUSE_ENTER_CALENDAR_SECTION':
            return {
                ...state,
                hoverCRN: action.crn
            };
        case 'MOUSE_LEAVE_CALENDAR_SECTION':
            return {
                ...state,
                hoverCRN: undefined
            };
        case 'HIGHLIGHT_COURSE_TABLE_SECTION_AND_REQUEST_SECTION_DETAILS':
            let selectedSectionId = state.highlightSectionId == action.sectionId ? null : action.sectionId;
            return {
                ...state,
                highlightCourseId: action.courseId,
                highlightSectionId: selectedSectionId,
                sectionDetails: {
                    state: selectedSectionId == null ? DATA_LOADING_STATE.NO_SELECTION : DATA_LOADING_STATE.LOADING,
                    data: null
                }
            };
        case 'HIGHLIGHT_COURSE_TABLE_SECTION_AND_RECEIVE_SECTION_DETAILS':
            return {
                ...state,
                highlightCourseId: action.courseId,
                highlightSectionId: state.highlightSectionId,
                sectionDetails: {
                    state: DATA_LOADING_STATE.LOADED,
                    data: action.sectionDetails
                }
            };
        case 'CLICK_VIEW_COURSE_TABLE_BUTTON':
            return {
                ...state,
                clickedCourseButtonId: action.courseId,
                highlightCourseId: action.courseId,
                highlightSectionId: state.courses.find((x) => x.courseId == action.courseId).selected,
                sectionDetails: {state: DATA_LOADING_STATE.NO_SELECTION}
            };
        case 'CLOSE_SECTION_LIST_MODAL':
            return {
                ...state,
                highlightCourseId: null,
                highlightSectionId: null,
                clickedCourseButtonId: undefined,
                sectionDetails: {state: DATA_LOADING_STATE.NO_SELECTION},
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
                // courses: state.courses.map(x => x.courseId !== courseId ? x :
                //         {
                //             ...x,
                //             sections: initializeSections(action.courseData.course.sections),
                //             cacheTime: action.courseData.cache_time,
                //             dataStatus: 'loaded'
                //         }
                // ).concat(
                //     EXTRA_SECTION_TYPES
                //         .filter(x => action.courseData.course.extraSectionsByType.hasOwnProperty(x))
                //         .map(x => ({
                //             color: 'red',
                //             department: action.department,
                //             course: action.course + x,
                //             courseId: courseId + x,
                //             sections: initializeSections(action.courseData.course.extraSectionsByType[x]),
                //             isIndependent: action.courseData.course.isExtraSectionIndependent[x],
                //             parentCourseId: courseId,
                //             dataStatus: 'loaded'
                //         }))
                // )
            };
        default:
            return state
    }
};