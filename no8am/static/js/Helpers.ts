import {createSelector} from "reselect";

import {SearchItemType} from "./Constants";
import {IAllReducers, ISearchItem, ISectionMain, Section} from "./Interfaces";

import {getSelectedSearchItem, getSelectedSectionsForSearchItem,
        getUnselectedSearchItems} from "./sections/SectionReducer";

export const isMainSection = (section: Section): section is ISectionMain => {
    return section.main;
};

// TODO - filter by origin abbreviation when possible - this is necessary for SectionList transitions

const filterSectionsWithSearchItem = (searchItem: ISearchItem, allSections: Section[]) => {
    const abbreviation = searchItem.originItemAbbreviation === null ?
        searchItem.currentItemBaseAbbreviation :
        searchItem.originItemAbbreviation;

    const searchType = searchItem.searchItemType;

    if (searchType === SearchItemType.Course) {
        return allSections.filter((section) => section.departmentAndBareCourse === abbreviation);
    } else if (searchType === SearchItemType.Department) {
        return allSections.filter((section) => section.department === abbreviation);
    } else if (searchType === SearchItemType.CCC) {
        return allSections.filter((section) => section.CCC.includes(abbreviation));
    } else if (searchType === SearchItemType.Credit) {
        return allSections.filter((section) => section.credits === abbreviation);
    } else {
        throw new Error("Cannot return sections for currently selected course card.");
    }
};

/**
 * Creates a list of abbreviations that will get grouped together in a single card. The purpose of this is to group
 * different section types for the same course in a single card.
 * @param baseAbbreviation Abbreviation to search for in list of all sections
 */
const getAllAbbreviations = (searchItem: ISearchItem, allSections: Section[]): string[] => {
    const sectionsWithBaseAbbreviation = filterSectionsWithSearchItem(searchItem, allSections)
        .map((section) => section.departmentAndCourse);

    if (sectionsWithBaseAbbreviation.length === 0) {
        return [searchItem.currentItemBaseAbbreviation];
    } else {
        return [...new Set(sectionsWithBaseAbbreviation)];
    }
};

const getSearchItems = (state: IAllReducers): ISearchItem[] => state.sections.searchItems;
const getAllSections = (state: IAllReducers): Section[] => state.sections.allSections;

export const getSearchItemsWithBaseAbbreviations = createSelector(
    [getSearchItems, getAllSections],
    (searchItems, allSections) =>
        searchItems.map((currentSearchItem) => ({
            ...currentSearchItem,
            currentItemAllAbbreviations: getAllAbbreviations(currentSearchItem, allSections),
        }))
    ,
);

export const getSelectedSearchItemMemoized = createSelector(
    [getSearchItems],
    getSelectedSearchItem,
);

export const getUnselectedSearchItemsMemoized = createSelector(
    [getSearchItems],
    getUnselectedSearchItems,
);

// TODO - output more data here to show which course card is managing the sections
export const getAllManagedSections = createSelector(
    [getAllSections, getUnselectedSearchItemsMemoized],
    (allSections, searchItems) => searchItems
        // filter for cards that are managing sections (card is responsible for a single course)
        .filter((searchItem) =>
            searchItem.searchItemType === SearchItemType.Course || searchItem.originItemAbbreviation !== null)
        // get only the selected CRNs from each search item
        .map((searchItem) => filterSectionsWithSearchItem(searchItem, allSections))
        // flatten 2D list of managed sections
        .reduce((managedSectionsA, managedSectionsB) => managedSectionsA.concat(managedSectionsB), []),
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
            return filterSectionsWithSearchItem(searchItem, allSections);
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
