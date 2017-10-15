import {DATA_LOADING_STATE, SEARCH_ITEM_TYPE} from '../Constants'
import {ActionType} from '../actions/sectionActions'

export const defaultFilters = {
    filterTime: [0, 28],
    askShowSingleCourse: null,
    showSingleCourse: null,
    singleCourseOrigin: null
};

const initialState = {
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
        case ActionType.RECEIVE_METADATA:
            return {
                ...state,
                metadata: action.metadata
            };
        case ActionType.RECEIVE_SECTIONS:
            return {
                ...state,
                sectionLoading: false,
                sections: action.sections
            };
        case ActionType.TOGGLE_SEARCH_OMNIBOX:
            return {
                ...state,
                isSearchOmniboxOpen: !state.isSearchOmniboxOpen
            };
        case ActionType.CLOSE_SEARCH_OMNIBOX:
            return {
                ...state,
                isSearchOmniboxOpen: false
            };
        case ActionType.OPEN_SEARCH_OMNIBOX:
            return {
                ...state,
                isSearchOmniboxOpen: true
            };
        case ActionType.SEARCH_ITEM:
            let sections;

            switch (action.item.itemType) {
                case SEARCH_ITEM_TYPE.Course:
                    sections = state.sections.filter(section => section.departmentAndBareCourse == action.item.abbreviation);
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
                showSingleCourse: action.isFromCategorySearch ? action.item.abbreviation : null,
                singleCourseOrigin: action.isFromCategorySearch ? state.currentSearch.item.abbreviation : null,
                isFromCategorySearch: action.isFromCategorySearch,
                searchHistory: state.currentSearch.state == DATA_LOADING_STATE.NO_SELECTION ? state.searchHistory :
                    [state.currentSearch, ...state.searchHistory],
                currentSearch: {
                    state: DATA_LOADING_STATE.LOADED,
                    item: action.item,
                    data: sections
                }
            };
        case ActionType.CLICK_ADVANCED_SECTION_SELECTION:
            return {
                ...state,
                isAdvanced: !state.isAdvanced
            };
        case ActionType.CLICK_DONE_SELECTING:
            return {
                ...state,
                currentSearch: {
                    item: null,
                    state: DATA_LOADING_STATE.NO_SELECTION
                },
                ...defaultFilters
            };
        case ActionType.MOUSE_ENTER_SECTION_LIST_CARD:
            return {
                ...state,
                sectionListHoverSection: action.section
            };
        case ActionType.MOUSE_LEAVE_SECTION_LIST_CARD:
            return {
                ...state,
                sectionListHoverSection: null
            };
        case ActionType.CLICK_SECTION_LIST_CARD:
            let filteredSections = state.selectedSections.filter(section => 
                section.departmentAndCourse != action.section.departmentAndCourse);

            let isReset = state.selectedSections.length != state.selectedSections.filter(section => section.CRN != action.section.CRN).length;

            let shouldAskShowSingleCourse = state.currentSearch.item.itemType == SEARCH_ITEM_TYPE.Department &&
                !isReset && state.showSingleCourse == null;

            return {
                ...state,
                selectedSections: isReset ? filteredSections : [
                    ...filteredSections,
                    [action.section.departmentAndBareCourse, action.section.CRN]
                ],
                askShowSingleCourse: shouldAskShowSingleCourse ? action.section.departmentAndCourse : null
            };
        case ActionType.CLICK_SHOW_SINGLE_COURSE:
            return {
                ...state,
                showSingleCourse: action.departmentAndBareCourse,
                singleCourseOrigin: state.currentSearch.item.abbreviation,
                askShowSingleCourse: null
            };
        case ActionType.UPDATE_FILTER_TIME:
            return {
                ...state,
                filterTime: action.filterTime
            };
        case ActionType.CLICK_REMOVE_SHOW_SINGLE_COURSE:
            return {
                ...state,
                showSingleCourse: null,
                singleCourseOrigin: null,
                isFromCategorySearch: false,
                searchHistory: state.isFromCategorySearch ? state.searchHistory.splice(1, ) : state.searchHistory,
                currentSearch: state.isFromCategorySearch ? state.searchHistory[0] : state.currentSearch
            };
        case ActionType.MOUSE_ENTER_CALENDAR_SECTION:
            return {
                ...state,
                hoverCRN: action.crn
            };
        case ActionType.MOUSE_LEAVE_CALENDAR_SECTION:
            return {
                ...state,
                hoverCRN: undefined
            };
        default:
            return state
    }
};