import {getType} from "ts-redux-actions";

import {DataLoadingState, SearchItemType} from "../Constants";
import {IMetadata, ISearchItem, ISectionReducer, Section} from "../Interfaces";

import * as SectionActions from "./SectionActions";
import { clickManagedCard } from "./SectionActions";
import { currentId } from "async_hooks";

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
                    searchItems: clickSectionListCard(action.section, action.isManaged,
                        state.allSections, state.searchItems),
                };

            case getType(SectionActions.clickCourseCard):
                return {
                    ...state,
                    searchItems: selectSearchItem(action.clickedSearchItem, state.searchItems),
                };

            case getType(SectionActions.goToManagedCard):
                return {
                    ...state,
                    searchItems: goToManagedCard(action.abbreviation, state.searchItems),
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

            case getType(SectionActions.searchAgainForAbbreviation):
                return {
                    ...state,
                    searchItems: searchAgainForAbbreviation(state.searchItems),
                };

            default:
                return state;
        }
    };

/**
 * True if the selected search item's abbrevation matches the one passed to the function.
 * @param searchItem Abbreviation to compare to the selected search item
 * @param searchItems Array of all search items
 */
const isSearchItemSelected = (searchItem: ISearchItem, searchItems: ISearchItem[]): boolean => {
    const selectedSearchItem = getSelectedSearchItem(searchItems);
    return isSearchItemEqual(selectedSearchItem, searchItem);
};

/**
 * True if the input search items are equal. Returns false if either is undefined.
 * @param searchItemA First search item
 * @param searchItemB Second search item
 */
const isSearchItemEqual = (searchItemA: ISearchItem | undefined, searchItemB: ISearchItem | undefined) =>
    searchItemA !== undefined
    && searchItemB !== undefined
    && (searchItemA.currentItemCourseAbbreviation === searchItemB.currentItemCourseAbbreviation
    || (searchItemA.originItemAbbreviation === searchItemB.originItemAbbreviation
        && searchItemA.searchItemType === searchItemB.searchItemType
        && searchItemA.currentItemCourseAbbreviation === null
        && searchItemB.currentItemCourseAbbreviation === null));

/**
 * Redirects user to a managed search if they click a managed section card in the section list.
 * @param abbreviation Abbreviation for a managed search
 * @param searchItems List of current searches
 */
const goToManagedCard = (abbreviation: string, searchItems: ISearchItem[]): ISearchItem[] => {
    const searchItemMatchingAbbreviation = searchItems.find((currentSearchItem) =>
        currentSearchItem.currentItemCourseAbbreviation === abbreviation);

    return searchItemMatchingAbbreviation === undefined ?
        searchItems :
        selectSearchItem(searchItemMatchingAbbreviation, searchItems);
};

/**
 * Selects a search item.
 * @param searchItemToSelect Search item to select
 * @param searchItems List of current searches
 */
const selectSearchItem = (searchItemToSelect: ISearchItem, searchItems: ISearchItem[]): ISearchItem[] =>
    isSearchItemSelected(searchItemToSelect, searchItems) ?
        // only deselect the search item if the clicked search item was already selected
        deselectAllSearchItems(searchItems) :
        // deselected the selected search item (if any) and select the one that was clicked
        deselectAllSearchItems(searchItems).map((currentSearchItem) => ({
            ...currentSearchItem,
            isSelected: isSearchItemEqual(currentSearchItem, searchItemToSelect),
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

export const searchAgainForAbbreviation = (searchItems: ISearchItem[]): ISearchItem[] => {
    const selectedSearchItem = getSelectedSearchItem(searchItems);

    // remove course abbreviation and add new search item
    const searchItemsWithoutCourseAbbreviation = searchItems.map((currentSearchItem) =>
        currentSearchItem !== selectedSearchItem ? currentSearchItem :
            {
                ...selectedSearchItem,
                isSelected: false,
                originItemAbbreviation: null,
                searchItemType: SearchItemType.Course,
        },
    );

    return selectedSearchItem === undefined ? searchItems : [...searchItemsWithoutCourseAbbreviation, {
        ...selectedSearchItem,
        currentItemCourseAbbreviation: null,
        selectedCrns: [],
    }];
};

/**
 * Finds current search item and moves originItemAbbreviation to currentItemBaseAbbreviation
 * @param searchItems List of all search items
 */
const revertToOriginItemAbbreviation = (searchItems: ISearchItem[]): ISearchItem[] => {
    const selectedSearchItem = getSelectedSearchItem(searchItems);

    if (selectedSearchItem === undefined) {
        // nothing to revert
        throw new Error("attempted to revert when search item was undefined");
    } else {
        // remove course abbreviation and selected sections
        return searchItems.map((currentSearchItem) => currentSearchItem !== selectedSearchItem ? currentSearchItem :
            {
                ...selectedSearchItem,
                currentItemCourseAbbreviation: null,
                selectedCrns: [],
            },
        );
    }
};

/**
 * Add item being searched to current list of searches, or select the item if it is already in the list.
 * @param newSearch Item being searched
 * @param allSections List of all sections
 * @param searchItems Current list of searches
 */
const newSearchItem = (newSearch: IMetadata, allSections: Section[], searchItems: ISearchItem[]): ISearchItem[] => {

    // use search type and abbreviation to create searchItem
    const searchItemFromMetadata = {
        currentItemCourseAbbreviation: newSearch.itemType === SearchItemType.Course ?
            newSearch.abbreviation :
            null,
        isSelected: true,
        originItemAbbreviation: newSearch.itemType !== SearchItemType.Course ?
            newSearch.abbreviation :
            null,
        searchItemType: newSearch.itemType,
        selectedCrns: [],
    };

    // check if this search item already exists
    const newSearchInSearchItems = searchItems.find(
        (currentSearchItem) => isSearchItemEqual(currentSearchItem, searchItemFromMetadata));

    if (newSearchInSearchItems) {
        // select the search item if it already exists
        return selectSearchItem(newSearchInSearchItems, searchItems);
    } else {
        // add the new search item
        return [
            ...deselectAllSearchItems(searchItems),
            searchItemFromMetadata,
        ];
    }
};

const selectSearchItemManagerForSection = (clickedSection: Section, searchItems: ISearchItem[]) => {
    const searchItemManager = searchItems.find((currentSearchItem) =>
        currentSearchItem.currentItemCourseAbbreviation === clickedSection.departmentAndBareCourse);

    return searchItemManager === undefined ? searchItems : selectSearchItem(searchItemManager, searchItems);
};

/**
 * Adds section to list of selected sections if it is not in the list. Removes section from the list if it exists.
 * @param clickedSection Section to add or remove
 * @param allSections List of all sections
 * @param searchItems List of all searches that have been performed by the user
 */
const clickSectionListCard = (clickedSection: Section, isManaged: boolean, allSections: Section[],
                              searchItems: ISearchItem[]): ISearchItem[] =>
    isManaged ? selectSearchItemManagerForSection(clickedSection, searchItems) :
    searchItems.map((currentSearchItem) => {
        if (!currentSearchItem.isSelected) {
            return currentSearchItem;
        } else {
            const isInSelectedCrns = currentSearchItem.selectedCrns.find((crn) => crn === clickedSection.CRN);

            return {
                ...currentSearchItem,
                currentItemCourseAbbreviation: clickedSection.departmentAndBareCourse,
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
