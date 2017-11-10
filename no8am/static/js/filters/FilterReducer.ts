import {FilterActions, FilterActionType} from "./FilterActions";

export const defaultFilters = {
    askShowSingleCourse: null,
    filterTime: [0, 28],
    showSingleCourse: null,
    singleCourseOrigin: null,
    // TODO - add create function isRevertible, that uses selectedSections.
};

const initialState = {
    isAdvanced: false,
    ...defaultFilters,
};

export const sectionReducer = (state = initialState, action: FilterActions) => {
    switch (action.type) {

        case FilterActionType.CLICK_ADVANCED_SECTION_SELECTION:
            return {
                ...state,
                isAdvanced: !state.isAdvanced,
            };

        case FilterActionType.CLICK_SHOW_SINGLE_COURSE:
            return {
                ...state,
                askShowSingleCourse: null,
                showSingleCourse: action.departmentAndBareCourse,
                singleCourseOrigin: state.currentSearch.item.abbreviation,
            };

        case FilterActionType.UPDATE_FILTER_TIME:
            return {
                ...state,
                filterTime: action.filterTime,
            };

        case FilterActionType.CLICK_REMOVE_SHOW_SINGLE_COURSE:
            return {
                ...state,
                currentSearch: state.isFromCategorySearch ? state.searchHistory[0] : state.currentSearch,
                isFromCategorySearch: false,
                searchHistory: state.isFromCategorySearch ? state.searchHistory.splice(1, ) : state.searchHistory,
                showSingleCourse: null,
                singleCourseOrigin: null,
            };

        // case SectionActionType.SEARCH_ITEM:
        //     let sections;

        //     switch (action.item.itemType) {
        //         case SEARCH_ITEM_TYPE.Course:
        //             sections = state.sections.filter(section => section.departmentAndBareCourse == action.item.abbreviation);
        //             break;

        //         case SEARCH_ITEM_TYPE.Department:
        //             sections = state.sections.filter(section => section.department == action.item.abbreviation);
        //             break;

        //         case SEARCH_ITEM_TYPE.CCC:
        //             sections = state.sections.filter(section => section.CCC.find(ccc => ccc == action.item.abbreviation));
        //             break;

        //         case SEARCH_ITEM_TYPE.Credit:
        //             sections = state.sections.filter(section => section.credits == action.item.abbreviation);
        //             break;

        //         default:
        //             sections = [];
        //             break;
        //     }

        //     return {
        //         ...state,
        //         showSingleCourse: action.isFromCategorySearch ? action.item.abbreviation : null,
        //         singleCourseOrigin: action.isFromCategorySearch ? state.currentSearch.item.abbreviation : null,
        //         isFromCategorySearch: action.isFromCategorySearch
        //     };

        default:
            return state;
    }
};
