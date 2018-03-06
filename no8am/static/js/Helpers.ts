import {createSelector} from "reselect";

import {SearchItemType} from "./Constants";
import {IAllReducers, ISearchItem, Section, SectionWithColor, IMetadata} from "./Interfaces";

import {getSelectedSearchItem, getUnselectedSearchItems} from "./sections/SectionReducer";

// filter by origin abbreviation when possible, this is necessary for SectionList transitions
export const filterSectionsWithSearchItem = (searchItem: ISearchItem, allSections: Section[],
                                             chooseCourseOverOrigin: boolean) => {

    const abbreviation = searchItem.originItemAbbreviation === null ?
        searchItem.currentItemCourseAbbreviation :
        searchItem.originItemAbbreviation;

    const searchType = searchItem.searchItemType;

    if (chooseCourseOverOrigin && searchItem.currentItemCourseAbbreviation !== null) {
        return allSections.filter(
            (section) => section.departmentAndBareCourse === searchItem.currentItemCourseAbbreviation);
    }
    if (searchType === SearchItemType.Course) {
        return allSections.filter((section) => section.departmentAndBareCourse === abbreviation);
    } else if (searchType === SearchItemType.Department) {
        return allSections.filter((section) => section.department === abbreviation);
    } else if (searchType === SearchItemType.CCC && abbreviation !== null) {
        return allSections.filter((section) => section.CCC.includes(abbreviation));
    } else if (searchType === SearchItemType.Credit) {
        return allSections.filter((section) => section.credits === abbreviation);
    } else {
        throw new Error("Cannot return sections for currently selected course card.");
    }
};

export const filterSectionsWithSearchItemWithColor = (searchItem: ISearchItem, allSections: Section[],
                                                      chooseCourseOverOrigin: boolean): SectionWithColor[] =>
    filterSectionsWithSearchItem(searchItem, allSections, chooseCourseOverOrigin)
        .map((section) => ({...section, color: searchItem.color}));

export const getSearchItems = (state: IAllReducers): ISearchItem[] => state.sections.searchItems;
export const getAllSections = (state: IAllReducers): Section[] => state.sections.allSections;

export const getSelectedSearchItemMemoized = createSelector(
    [getSearchItems],
    getSelectedSearchItem,
);

export const getUnselectedSearchItemsMemoized = createSelector(
    [getSearchItems],
    getUnselectedSearchItems,
);

export const getSearchItemsWithSections = createSelector(
    [getSearchItems, getAllSections],
    (searchItems, allSections) =>
        searchItems.map((currentSearchItem) => ({
            ...currentSearchItem,
            sectionsInSearchItem: filterSectionsWithSearchItemWithColor(currentSearchItem, allSections, true),
        })),
);

export const getSelectedSections = createSelector(
    [getSearchItemsWithSections],
    (searchItemsWithSections) => searchItemsWithSections
        // get selected sections for each search item
        .map((currentSearchItem) => currentSearchItem.sectionsInSearchItem.filter((section) =>
            currentSearchItem.selectedCrns.find((currentCrn) => section.CRN === currentCrn) !== undefined))
        // flatten to 1D array of selected sections
        .reduce((selectedSections, nextSelectedSections) => selectedSections.concat(nextSelectedSections), []),
);
