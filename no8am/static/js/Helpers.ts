import {createSelector} from "reselect";

import {SearchItemType} from "./Constants";
import {IAllReducers, ISearchItem, ISectionMain, Section} from "./Interfaces";

import {getSelectedSearchItem, getSelectedSectionsForSearchItem,
        getUnselectedSearchItems} from "./sections/SectionReducer";

export const isMainSection = (section: Section): section is ISectionMain => {
    return section.main;
};

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

// TODO - see if this is needed
// export const getFilterCourseForSelectedCourseCard = createSelector(
//     [getSelectedSearchItemMemoized],
//     (searchItem) => {
//         if (searchItem.originItemAbbreviation !== nu) {
//             return null;
//         } else if (searchItem.searchItemType === SearchItemType.Course) {
//             return searchItem.currentItemBaseAbbreviation;
//         } else {
//             return searchItem.originItemAbbreviation;
//         }
//     },
// );

export const getSelectedSectionsForSelectedCourseCard = createSelector(
    [getAllSections, getSelectedSearchItemMemoized],
    // filter all sections by sections that match selected crns for the current card
    getSelectedSectionsForSearchItem,
);

export const getSectionsForSearchItem = createSelector(
    [getSelectedSearchItemMemoized, getAllSections],
    (searchItem, allSections) => {
        if (searchItem === undefined) {
            return [];
        } else {
            return filterSectionsWithSearchItem(searchItem, allSections, false);
        }
    },
);

const getSectionListHoverCrn = (state: IAllReducers): string | null => state.sections.sectionListHoverCrn;

export const getSectionListHoverSection = createSelector(
    [getSectionListHoverCrn, getAllSections],
    (hoverCRN, allSections) => hoverCRN === null ? undefined : allSections.find((section) => section.CRN === hoverCRN),
);

export const getSelectedSections = createSelector(
    [getAllSections, getSearchItems],
    (allSections, searchItems) => searchItems
        // get only the selected CRNs from each search item
        .map((searchItem) => searchItem.selectedCrns)
        // flatten to 1D array of selected crns
        .reduce((selectedCrns, nextSelectedCrns) => selectedCrns.concat(nextSelectedCrns), [])
        // get the section of corresponding to the selected CRN
        .map((selectedCrn) => allSections.find((section) => section.CRN === selectedCrn))
        // remove sections that were not found (this should only happen if the course catalog changes/removes a CRN)
        .filter((section) => section !== undefined),
);
