import {getType} from "ts-redux-actions";

import {DataLoadingState, SearchItemType} from "../Constants";
import {IMetadata, ISearchItem, ISectionReducer, Section} from "../Interfaces";

import * as SectionActions from "./SectionActions";

const initialState: ISectionReducer = {
    allSections: [],
    searchItems: [],
    sectionListHoverCrn: null,
    status: DataLoadingState.LOADING,
};

export const sections = (state = initialState, action: SectionActions.IActions): ISectionReducer => {

        switch (action.type) {
            case getType(SectionActions.receiveSections):
                return {
                    ...state,
                    allSections: action.sections,
                    status: DataLoadingState.LOADED,
                };

            case getType(SectionActions.errorReceivingSections):
                return {
                    ...state,
                    status: DataLoadingState.FAILED,
                };

            case getType(SectionActions.mouseEnterSectionListCard):
                return {
                    ...state,
                    sectionListHoverCrn: action.section.CRN,
                };

            case getType(SectionActions.mouseLeaveSectionListCard):
                return {
                    ...state,
                    sectionListHoverCrn: null,
                };

            case getType(SectionActions.clickSectionListCard):
                return {
                    ...state,
                    searchItems: clickSectionListCard(action.section, state.allSections, state.searchItems),
                };

            case getType(SectionActions.clickCourseCard):
                return {
                    ...state,
                    searchItems: selectSearchItem(action.abbreviation, state.searchItems),
                };

            case getType(SectionActions.searchItem):
                return {
                    ...state,
                    searchItems: newSearchItem(action.item, state.allSections, state.searchItems),
                };

            case getType(SectionActions.clickDoneSelecting):
                return {
                    ...state,
                    searchItems: deselectAllSearchItems(state.searchItems),
                };

            case getType(SectionActions.revertToOriginAbbreviation):
                return {
                    ...state,
                    searchItems: revertToOriginItemAbbreviation(state.searchItems),
                };

            default:
                return state;
        }
    };

/**
 * True if the selected search item's abbrevation matches the one passed to the function.
 * @param searchItemAbbreviation Abbreviation to compare to the selected search item
 * @param searchItems Array of all search items
 */
const isSearchItemSelected = (searchItemAbbreviation: string, searchItems: ISearchItem[]): boolean => {
    const searchItem = getSelectedSearchItem(searchItems);
    return searchItem === undefined ? false : searchItem.currentItemBaseAbbreviation === searchItemAbbreviation;
};

/**
 * Selects a search item.
 * @param searchItemAbbreviation Abbreviation of item to select
 * @param searchItems List of current searches
 */
const selectSearchItem = (searchItemAbbreviation: string, searchItems: ISearchItem[]): ISearchItem[] =>
    isSearchItemSelected(searchItemAbbreviation, searchItems) ?
        // only deselect the search item if the clicked search item was already selected
        deselectAllSearchItems(searchItems) :
        // deselected the selected search item (if any) and select the one that was clicked
        deselectAllSearchItems(searchItems).map((currentSearchItem) => ({
            ...currentSearchItem,
            isSelected: currentSearchItem.currentItemBaseAbbreviation === searchItemAbbreviation,
        }));

/**
 * Deselect all items in list of current search items.
 * @param searchItems List of current searches to deselect
 */
const deselectAllSearchItems = (searchItems: ISearchItem[]): ISearchItem[] =>
    searchItems.map((currentSearchItem) => ({
        ...currentSearchItem,
        isSelected: false,
    }));

/**
 * Get selected search item, if there is one.
 * @param searchItems List of all search items
 */
export const getSelectedSearchItem = (searchItems: ISearchItem[]): ISearchItem | undefined =>
    searchItems.find((currentSearchItem) => currentSearchItem.isSelected);

/**
 * Get list of unselected search items.
 * @param searchItems List of all search items
 */
export const getUnselectedSearchItems = (searchItems: ISearchItem[]): ISearchItem[] =>
    searchItems.filter((currentSearchItem) => !currentSearchItem.isSelected);

/**
 * Finds current search item and moves originItemAbbreviation to currentItemBaseAbbreviation
 * @param searchItems List of all search items
 */
const revertToOriginItemAbbreviation = (searchItems: ISearchItem[]): ISearchItem[] => {
    const selectedSearchItem = getSelectedSearchItem(searchItems);
    const unselectedSearchItems = getUnselectedSearchItems(searchItems);

    if (selectedSearchItem === undefined) {
        return unselectedSearchItems;
    } else if (selectedSearchItem.originItemAbbreviation === null) {
        return searchItems;
    } else {
        return [
            ...unselectedSearchItems,
            {
                ...selectedSearchItem,
                currentItemBaseAbbreviation: selectedSearchItem.originItemAbbreviation,
                originItemAbbreviation: null,
            },
        ];
    }
};

/**
 * Add item being searched to current list of searches, or select the item if it is already in the list.
 * @param newSearch Item being searched
 * @param allSections List of all sections
 * @param searchItems Current list of searches
 */
const newSearchItem = (newSearch: IMetadata, allSections: Section[], searchItems: ISearchItem[]): ISearchItem[] => {
    const newSearchAbbreviation = newSearch.abbreviation;
    const newSearchInSearchItems = searchItems.find(
        (currentSearchItem) => currentSearchItem.currentItemBaseAbbreviation === newSearchAbbreviation);

    if (newSearchInSearchItems) {
        return selectSearchItem(newSearchAbbreviation, searchItems);
    } else {
        return [
            ...deselectAllSearchItems(searchItems),
            {
                currentItemBaseAbbreviation: newSearchAbbreviation,
                isSelected: true,
                originItemAbbreviation: null,
                searchItemType: newSearch.itemType,
                selectedCrns: [],
            },
        ];
    }
};

/**
 * Adds section to list of selected sections if it is not in the list. Removes section from the list if it exists.
 * @param clickedSection Section to add or remove
 * @param allSections List of all sections
 * @param searchItems List of all searches that have been performed by the user
 */
const clickSectionListCard = (clickedSection: Section, allSections: Section[],
                              searchItems: ISearchItem[]): ISearchItem[] =>
    searchItems.map((currentSearchItem) => {
        if (!currentSearchItem.isSelected) {
            return currentSearchItem;
        } else {
            const isInSelectedCrns = currentSearchItem.selectedCrns.find((crn) => crn === clickedSection.CRN);
            const noNewOrigin = clickedSection.departmentAndBareCourse ===
                                currentSearchItem.currentItemBaseAbbreviation;

            return {
                ...currentSearchItem,
                currentItemBaseAbbreviation: noNewOrigin ?
                currentSearchItem.currentItemBaseAbbreviation :
                    clickedSection.departmentAndBareCourse,
                originItemAbbreviation: noNewOrigin ?
                    currentSearchItem.originItemAbbreviation :
                    currentSearchItem.currentItemBaseAbbreviation,
                selectedCrns: isInSelectedCrns ?
                    // deselect clicked section by removing itself from selected crns
                    currentSearchItem.selectedCrns.filter((crn) => crn !== clickedSection.CRN) :
                    // removed selected siblings and add the new crn
                    [...removeSelectedSiblings(clickedSection, allSections, currentSearchItem), clickedSection.CRN],
            };
        }
    });

/**
 * Filters out siblings of clicked section from the list of crns.
 * Used to replace a sibling section with the clicked section.
 * @param clickedSection Section object corresponding to the clicked course card
 * @param allSections List of all sections
 * @param searchItem Object containing selected crns
 */
const removeSelectedSiblings = (clickedSection: Section, allSections: Section[],
                                searchItem: ISearchItem): string[] =>
    searchItem.selectedCrns.filter((selectedCrn) => {
        // find section object for one of the selected sections
        const currentSelectedSection = allSections.find((section) => section.CRN === selectedCrn);
        // check if the section is a sibling of the clicked section
        return currentSelectedSection === undefined ? false :
               currentSelectedSection.departmentAndCourse !== clickedSection.departmentAndCourse;
    });

/**
 * Gets selected sections for a search item
 * @param allSections List of all sections
 * @param searchItem Object containing selected crns
 */
export const getSelectedSectionsForSearchItem = (allSections: Section[], searchItem: ISearchItem | undefined) =>
    searchItem === undefined ? [] : allSections.filter((section) =>
        searchItem.selectedCrns.find((selectedCrn) => selectedCrn === section.CRN) !== undefined);
