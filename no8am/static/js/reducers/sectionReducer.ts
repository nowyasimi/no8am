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
    sectionsLoading: true,
    sections: [],
    ...defaultFilters
};


export const sectionReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'RECEIVE_METADATA':
            return {
                ...state,
                metadata: action.metadata
            };
        case 'RECEIVE_SECTIONS':
            return {
                ...state,
                sectionLoading: false,
                sections: action.sections
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
        case 'SEARCH_ITEM':
            let sections;

            switch (action.item.itemType) {
                case SEARCH_ITEM_TYPE.Course:
                    sections = state.sections.filter(section => section.departmentAndBareCourse == action.item.courseNum);
                    break;

                case SEARCH_ITEM_TYPE.Department:
                    sections = state.sections.filter(section => section.department == action.item.abbreviation);
                    break;

                case SEARCH_ITEM_TYPE.CCC:
                    sections = state.sections.filter(section => section.CCC.find(ccc => ccc == action.item.abbreviation));
                    break;

                case SEARCH_ITEM_TYPE.Credit:
                    sections = state.sections.filter(section => section.credits == action.item.abbreviation);
                    break;

                default:
                    sections = [];
                    break;
            }

            return {
                ...state,
                showSingleCourse: action.isFromCategorySearch ? action.item.courseNum : null,
                isFromCategorySearch: action.isFromCategorySearch,
                searchHistory: state.currentSearch.state == DATA_LOADING_STATE.NO_SELECTION ? state.searchHistory :
                    [state.currentSearch, ...state.searchHistory],
                currentSearch: {
                    state: DATA_LOADING_STATE.LOADED,
                    item: action.item,
                    data: sections
                }
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
                showSingleCourse: null,
                isFromCategorySearch: false,
                searchHistory: state.isFromCategorySearch ? state.searchHistory.splice(1, ) : state.searchHistory,
                currentSearch: state.isFromCategorySearch ? state.searchHistory[0] : state.currentSearch
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
        default:
            return state
    }
};