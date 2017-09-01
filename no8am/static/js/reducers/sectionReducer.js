import {DATA_LOADING_STATE, SEARCH_ITEM_TYPE} from '../Constants'

export const defaultFilters = {
    filterTime: [0, 28],
    askShowSingleCourse: null,
    showSingleCourse: null
};

const initialState = {
    courses:[],
    courseCounter: 1,
    isSearchOmniboxOpen: false,
    searchHistory: [],
    currentSearch: {
        item: null,
        state: DATA_LOADING_STATE.NO_SELECTION
    },
    selectedSections: [],
    isAdvanced: false,
    metadata: {
        loading: true,
        items: []
    },
    ...defaultFilters
};


export const sectionReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'RECEIVE_METADATA':
            return {
                ...state,
                metadata: action.metadata
            };
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
                currentSearch: {
                    item: action.item,
                    state: DATA_LOADING_STATE.LOADING
                },
                ...defaultFilters
            };
        case 'RECEIVE_ITEM':
            let isFromCategorySearch = state.currentSearch.item.itemType != SEARCH_ITEM_TYPE.Course &&
                                       state.currentSearch.item.itemType != SEARCH_ITEM_TYPE.Department;

            return {
                ...state,
                searchHistory: state.currentSearch.state == DATA_LOADING_STATE.NO_SELECTION ? state.searchHistory :
                    [state.currentSearch, ...state.searchHistory],
                currentSearch: {
                    ...state.currentSearch,
                    state: DATA_LOADING_STATE.LOADED,
                    data: action.data,
                    isFromCategorySearch: isFromCategorySearch
                },
                showSingleCourse: isFromCategorySearch ? state.currentSearch.item.courseNum : null
            };
        case 'CLICK_ADVANCED_SECTION_SELECTION':
            return {
                ...state,
                isAdvanced: !state.isAdvanced
            };
        case 'CLICK_DONE_SELECTING':
            return {
                ...state,
                currentSearch: {
                    item: null,
                    state: DATA_LOADING_STATE.NO_SELECTION
                },
                ...defaultFilters
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
            let filteredSections = state.selectedSections.filter(section => section.CRN != action.section.CRN);

            let isReset = filteredSections.length != state.selectedSections.length;

            let shouldAskShowSingleCourse = state.currentSearch.item.itemType == SEARCH_ITEM_TYPE.Department &&
                !isReset && state.showSingleCourse == null;

            return {
                ...state,
                selectedSections: isReset ? filteredSections : [
                    ...filteredSections,
                    action.section
                ],
                askShowSingleCourse: shouldAskShowSingleCourse ? action.section.departmentAndCourse : null
            };
        case 'CLICK_SHOW_SINGLE_COURSE':
            return {
                ...state,
                showSingleCourse: action.departmentAndBareCourse,
                askShowSingleCourse: null
            };
        case 'UPDATE_FILTER_TIME':
            return {
                ...state,
                filterTime: action.filterTime
            };
        case 'CLICK_REMOVE_SHOW_SINGLE_COURSE':
            return {
                ...state,
                showSingleCourse: null
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