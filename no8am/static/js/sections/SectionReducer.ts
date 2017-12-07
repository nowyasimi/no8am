import {getType} from "ts-redux-actions";

import {DataLoadingState, SEARCH_ITEM_TYPE} from "../Constants";
import {IMetadata, ISearchItem, ISection, ISectionReducer} from "../Interfaces";

import * as SectionActions from "./SectionActions";

const initialState: ISectionReducer = {
    allSections: [],
    searchItems: [],
    sectionListHoverCrn: null,
    status: DataLoadingState.LOADING,
};

// TODO - Show if a section has already been selected in another searchItem

export const sections = (state: ISectionReducer = initialState, action: SectionActions.IActions): ISectionReducer => {

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
 * Selects a search item.
 * @param searchItemAbbreviation Abbreviation of item to select
 * @param searchItems List of current searches
 */
const selectSearchItem = (searchItemAbbreviation: string, searchItems: ISearchItem[]): ISearchItem[] =>
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
const getSelectedSearchItem = (searchItems: ISearchItem[]): ISearchItem | undefined =>
    searchItems.find((currentSearchItem) => currentSearchItem.isSelected);

/**
 * Get list of unselected search items.
 * @param searchItems List of all search items
 */
const getUnselectedSearchItems = (searchItems: ISearchItem[]): ISearchItem[] =>
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
    } else if (selectedSearchItem.originItemAbbreviation === undefined) {
        return searchItems;
    } else {
        return [
            ...unselectedSearchItems,
            {
                ...selectedSearchItem,
                currentItemBaseAbbreviation: selectedSearchItem.originItemAbbreviation,
                originItemAbbreviation: undefined,
            },
        ];
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
        (currentSearchItem) => currentSearchItem.currentItemBaseAbbreviation === newSearchAbbreviation);

    if (newSearchInSearchItems) {
        return selectSearchItem(newSearchAbbreviation, searchItems);
    } else {
        return selectSearchItem(newSearchAbbreviation, [
            ...searchItems,
            {
                // TODO - move all abbreviations to CourseCard (potentially wrap it with reselect)
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
const clickSectionListCard = (clickedSection: ISection, allSections: ISection[],
                              searchItems: ISearchItem[]): ISearchItem[] =>
    searchItems.map((currentSearchItem) => {
        if (!currentSearchItem.isSelected) {
            return currentSearchItem;
        } else {
            const isInSelectedCrns = currentSearchItem.selectedCrns.find((crn) => crn === clickedSection.CRN);
            const noNewOrigin = allSections.find((section) =>
                clickedSection.departmentAndBareCourse === currentSearchItem.currentItemBaseAbbreviation) === undefined;

            return {
                ...currentSearchItem,
                currentItemAllAbbreviations: noNewOrigin ?
                currentSearchItem.currentItemAllAbbreviations :
                    getAllAbbreviations(clickedSection.departmentAndBareCourse, allSections),
                currentItemBaseAbbreviation: noNewOrigin ?
                currentSearchItem.currentItemBaseAbbreviation :
                    clickedSection.departmentAndBareCourse,
                originItemAbbreviation: noNewOrigin ?
                    currentSearchItem.originItemAbbreviation :
                    currentSearchItem.currentItemBaseAbbreviation,
                selectedCrns: isInSelectedCrns ?
                    currentSearchItem.selectedCrns.filter((crn) => crn !== clickedSection.CRN) :
                    [...currentSearchItem.selectedCrns, clickedSection.CRN],
            };
        }
    });
