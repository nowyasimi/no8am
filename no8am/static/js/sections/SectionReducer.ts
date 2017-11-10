import {DataLoadingState, SEARCH_ITEM_TYPE} from "../Constants";
import {IMetadata, ISearchItem, ISection, ISectionReducer} from "../Interfaces";
import {SectionActions, SectionActionType} from "./SectionActions";

const initialState: ISectionReducer = {
    allSections: [],
    searchItems: [],
    sectionListHoverCrn: null,
    status: DataLoadingState.LOADING,
};

// TODO - Show if a section has already been selected in another searchItem

/**
 * Selects a search item.
 * @param searchItemAbbreviation Abbreviation of item to select
 * @param searchItems List of current searches
 */
const selectSearchItem = (searchItemAbbreviation: string, searchItems: ISearchItem[]): ISearchItem[] =>
    deselectAllSearchItems(searchItems).map((searchItem) => ({
            ...searchItem,
            isSelected: searchItem.currentItemBaseAbbreviation === searchItemAbbreviation,
    }));

/**
 * Deselect all items in list of current search items.
 * @param searchItems List of current searches to deselect
 */
const deselectAllSearchItems = (searchItems: ISearchItem[]): ISearchItem[] =>
    searchItems.map((searchItem) => ({
        ...searchItem,
        isSelected: false,
    }));

/**
 * Creates a list of abbreviations that will get grouped together in a single card. The purpose of this is to group
 * different section types for the same course in a single card.
 * @param baseAbbreviation Abbreviation to search for in list of all sections
 */
const getAllAbbreviations = (baseAbbreviation: string, allSections: ISection[]): string[] => {
    const sectionsWithBaseAbbreviation = allSections.filter(
        (section: ISection) => section.departmentAndBareCourse === baseAbbreviation)
        .map((section) => section.departmentAndCourse);

    if (sectionsWithBaseAbbreviation.length === 0) {
        return [baseAbbreviation];
    } else {
        return [...new Set(sectionsWithBaseAbbreviation)];
    }
};

/**
 * Add item being searched to current list of searches, or select the item if it is already in the list.
 * @param newSearch Item being searched
 * @param searchItems Current list of searches
 */
const newSearchItem = (newSearch: IMetadata, allSections: ISection[], searchItems: ISearchItem[]): ISearchItem[] => {
    const newSearchAbbreviation = newSearch.abbreviation;
    const newSearchInSearchItems = searchItems.find(
        (searchItem) => searchItem.currentItemBaseAbbreviation === newSearchAbbreviation);

    if (newSearchInSearchItems) {
        return selectSearchItem(newSearchAbbreviation, searchItems);
    } else {
        return selectSearchItem(newSearchAbbreviation, [
            ...searchItems,
            {
                currentItemAllAbbreviations: getAllAbbreviations(newSearchAbbreviation, allSections),
                currentItemBaseAbbreviation: newSearchAbbreviation,
                isSelected: true,
                selectedCrns: [],
            },
        ]);
    }
};

/**
 * Adds section to list of selected sections if it is not in the list. Removes section from the list if it exists.
 * @param clickedSection Section to add or remove
 * @param searchItems List of all searches that have been performed by the user
 */
const clickSectionListCard = (clickedSection: ISection, searchItems: ISearchItem[]): ISearchItem[] =>
    searchItems.map((searchItem) => !searchItem.isSelected ? searchItem : {
        ...searchItem,
        selectedCrns: searchItem.selectedCrns.find((crn) => crn === clickedSection.CRN) ?
            searchItem.selectedCrns.filter((crn) => crn !== clickedSection.CRN) :
            [...searchItem.selectedCrns, clickedSection.CRN],
        // TODO - set originItemAbbreviation for course groups
    });

export const sectionReducer = (state: ISectionReducer = initialState, action: SectionActions): ISectionReducer => {
    switch (action.type) {
        case SectionActionType.RECEIVE_SECTIONS:
            return {
                ...state,
                allSections: action.sections,
                status: DataLoadingState.LOADED,
            };

        case SectionActionType.ERROR_RECEIVING_SECTIONS:
            return {
                ...state,
                status: DataLoadingState.FAILED,
            };

        case SectionActionType.MOUSE_ENTER_SECTION_LIST_CARD:
            return {
                ...state,
                sectionListHoverCrn: action.section.CRN,
            };

        case SectionActionType.MOUSE_LEAVE_SECTION_LIST_CARD:
            return {
                ...state,
                sectionListHoverCrn: null,
            };

        case SectionActionType.CLICK_SECTION_LIST_CARD:
            return {
                ...state,
                searchItems: clickSectionListCard(action.section, state.searchItems),
            };

        case SectionActionType.SEARCH_ITEM:
            return {
                ...state,
                searchItems: newSearchItem(action.item, state.allSections, state.searchItems),
            };

        case SectionActionType.CLICK_DONE_SELECTING:
            return {
                ...state,
                searchItems: deselectAllSearchItems(state.searchItems),
            };

        default:
            return state;
    }
};
