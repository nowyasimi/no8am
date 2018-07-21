import {createSelector} from "reselect";

import {SearchItemType} from "./Constants";
import {FilterTime, IAllReducers, ISearchItem, ISectionExtra, Section, SectionWithColor} from "./Interfaces";

import {getSelectedSearchItem} from "./sections/SectionReducer";

// filter by origin abbreviation when possible, this is necessary for SectionList transitions
export const filterSectionsWithSearchItem = (searchItem: ISearchItem, allSections: Section[]) => {

    const abbreviation = searchItem.originItemAbbreviation === null ?
        searchItem.currentItemCourseAbbreviation :
        searchItem.originItemAbbreviation;

    const searchType = searchItem.searchItemType;

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
const getFilterTime = (state: IAllReducers): FilterTime => state.filters.filterTime;
const getIsAdvanced = (state: IAllReducers) => state.filters.isAdvanced;

export const getSelectedSearchItemMemoized = createSelector(
    [getSearchItems],
    getSelectedSearchItem,
);

export const getSearchItemsWithSections = createSelector(
    [getSearchItems, getAllSections],
    (searchItems, allSections) => searchItems.map((currentSearchItem) => {
        const sectionsMatchingOrigin = filterSectionsWithSearchItem(currentSearchItem, allSections)
            .map((section) => ({...section, color: currentSearchItem.color}));

        const sectionsMatchingCourse = sectionsMatchingOrigin.filter(
            (section) => section.departmentAndBareCourse === currentSearchItem.currentItemCourseAbbreviation);

        return {
            ...currentSearchItem,
            sectionsMatchingCourse,
            sectionsMatchingOrigin,
            selectedSectionsInSearchItem: sectionsMatchingCourse
                .filter((section) => currentSearchItem.selectedCrns
                    .find((currentCrn) => section.CRN === currentCrn) !== undefined),
        };
    }),
);

export const getSelectedSearchItemWithSections = createSelector(
    [getSearchItemsWithSections],
    (searchItemsWithSections) => searchItemsWithSections.find((currentSearchItem) => currentSearchItem.isSelected),
);

export const getSelectedSections = createSelector(
    [getSearchItemsWithSections],
    (searchItemsWithSections) => searchItemsWithSections
        // get selected sections for each search item
        .map((currentSearchItem) => currentSearchItem.selectedSectionsInSearchItem)
        // flatten to 1D array of selected sections
        .reduce((selectedSections, nextSelectedSections) => selectedSections.concat(nextSelectedSections), []),
);

interface ISectionStartOrEndTime {
    day: string;
    isStartTime: boolean;
    section: SectionWithColor;
    time: number;
}

interface ISectionStartOrEndTimesByDay {
    [day: string]: ISectionStartOrEndTime[];
}

const separateSectionIntoStartAndEndTimes = (section: SectionWithColor): ISectionStartOrEndTime[] =>
    Array.prototype.concat(...section.meetingTimes.map((meetingTime) => ([{
                day: meetingTime.day,
                isStartTime: true,
                section,
                time: meetingTime.startTime,
            }, {
                day: meetingTime.day,
                isStartTime: false,
                section,
                time: meetingTime.startTime + meetingTime.duration,
            },
        ]),
    ));

const groupSectionsByDayReducer = (sectionsByDay: ISectionStartOrEndTimesByDay,
                                   sectionWithMeetingTime: ISectionStartOrEndTime) => ({
        ...sectionsByDay,
        [sectionWithMeetingTime.day]: sectionWithMeetingTime.day in sectionsByDay ?
            [...sectionsByDay[sectionWithMeetingTime.day], sectionWithMeetingTime] :
            [sectionWithMeetingTime],
    });

const sortSectionStartOrEndTimes = (a: ISectionStartOrEndTime, b: ISectionStartOrEndTime): number => {
    if (a.time === b.time) {
        if ((a.isStartTime && b.isStartTime) || (!a.isStartTime && !b.isStartTime)) {
            return 0;
        } else if (a.isStartTime && !b.isStartTime) {
            return -1;
        } else {
            return 1;
        }
    } else {
        return a.time > b.time ? -1 : 1;
    }
};

const findConflictsInDay = (sectionWithStartOrEndTime: ISectionStartOrEndTime[]): Section[][] => {

    const conflicts = [];
    const sortedSectionStartOrEndTimes = sectionWithStartOrEndTime.sort(sortSectionStartOrEndTimes);
    let classInSession = null;

    for (const currentClass of sortedSectionStartOrEndTimes) {
        if (currentClass.isStartTime && classInSession !== null) {
            conflicts.push(classInSession.section.CRN < currentClass.section.CRN ?
                [classInSession.section, currentClass.section] :
                [currentClass.section, classInSession.section]);
        } else if (currentClass.isStartTime && classInSession === null) {
            classInSession = currentClass;
        } else if (!currentClass.isStartTime && classInSession !== null) {
            classInSession = null;
        }
    }

    return conflicts;
};

export const findConflictSectionPairs = createSelector(
    [getSelectedSections],
    (selectedSections) => {

        const startOrEndTimesByDay: ISectionStartOrEndTimesByDay = Array.prototype
            .concat(...selectedSections.map(separateSectionIntoStartAndEndTimes))
            .reduce(groupSectionsByDayReducer, {});

        const conflicts = Object.keys(startOrEndTimesByDay)
            .map((day) => findConflictsInDay(startOrEndTimesByDay[day]))
            .reduce((allConflicts, currentConflicts) => [...allConflicts, ...currentConflicts], []);

        const uniqueConflicts: Section[][] = [];
        const uniqueConflictCrnPairs = new Set();

        conflicts.forEach((conflictPair) => {
            const key = conflictPair[0].CRN + "-" + conflictPair[1].CRN;
            if (!uniqueConflictCrnPairs.has(key)) {
                uniqueConflictCrnPairs.add(key);
            }

            uniqueConflicts.push(conflictPair);
        });

        return uniqueConflicts;
    },
);

export const getConflictCrns = createSelector(
    [findConflictSectionPairs],
    (conflictSectionPairs) => conflictSectionPairs
        .reduce((crns: string[], sectionPair) => [...crns, ...sectionPair.map((section) => section.CRN)], []),
);

export const getUniqueCCCs = createSelector(
    [getAllSections],
    (allSections) => [...new Set(allSections
        .map((section) => section.CCC)
        .reduce((allCCCs, sectionCCCs) => allCCCs.concat(sectionCCCs), []))]
        .sort(),
);

// handles case when another course card contains the course baseAbbreviation
const isSectionManaged = (section: Section, searchItem: ISearchItem, managedSections: Section[]): boolean =>
    searchItem.currentItemCourseAbbreviation === null
    && managedSections.find((managedSection) => managedSection.CRN === section.CRN) !== undefined;

// highlights selected sections and used to flag when a user selects an unavailable section
const isSectionSelected = (section: Section, selectedSections: string[]): boolean =>
    selectedSections.find((selectedCrn) => selectedCrn === section.CRN) !== undefined;

// identifies if a section cannot be selected based on other selected sections
const isSectionUnavailable = (section: Section, selectedSections: Section[]): boolean =>
    selectedSections.find((selectedSection) =>
        section.departmentAndBareCourse === selectedSection.departmentAndBareCourse &&
        (section.main && !selectedSection.main &&
            !(selectedSection as ISectionExtra).dependent_main_sections.includes(section.sectionNum)) ||
        (!section.main && selectedSection.main &&
            !(section as ISectionExtra).dependent_main_sections.includes(selectedSection.sectionNum)))
        !== undefined;

const isSectionVisible = (section: Section, searchItem: ISearchItem, isSelected: boolean,
                          isUnavailable: boolean, isAdvanced: boolean, filterTime: FilterTime): boolean =>
    // section has already been selected
    isSelected || (
    // show sections despite registrar restrictions if advanced mode is enabled
            (isAdvanced || !isUnavailable) &&
    // generic search was made and has not been narrowed down to a single course
            ((searchItem.currentItemCourseAbbreviation === null) ||
    // or search has been filtered for a single course
            (searchItem.currentItemCourseAbbreviation !== null &&
                searchItem.currentItemCourseAbbreviation === section.departmentAndBareCourse)) &&
    // section is within filtered time range
            (section.meetingTimes.every((meetingTime) => meetingTime.startTime >= filterTime[0] &&
                                    meetingTime.duration + meetingTime.startTime <= filterTime[1])));
    // section has at least one CCC is in the CCC filter
    // TODO - handle sections that do not fill any CCC requirement
            // (section.CCC.find((currentCCC) =>
            //     this.props.availableCCCs.find((currentAvailableCCC) =>
            //         currentAvailableCCC === currentCCC) !== undefined) !== undefined);

const getAllManagedSections = createSelector(
    [getSearchItemsWithSections],
    (searchItemsWithSections) => searchItemsWithSections
        // filter for unselected search items
        .filter((searchItem) => !searchItem.isSelected)
        // filter for cards that are managing sections (card is responsible for a single course)
        .filter((searchItem) => searchItem.currentItemCourseAbbreviation !== null)
        // get all sections this search item is responsible for
        .map((searchItem) => searchItem.sectionsMatchingCourse)
        // flatten 2D list of managed sections
        .reduce((managedSectionsA, managedSectionsB) => managedSectionsA.concat(managedSectionsB), []),
);

export const getSectionsForSelectedSearchItem = createSelector(
    [getSelectedSearchItemWithSections, findConflictSectionPairs, getAllManagedSections, getIsAdvanced, getFilterTime],
    (selectedSearchItemWithSections, conflictSectionPairs, managedSections, isAdvanced, filterTime) => {
        if (selectedSearchItemWithSections === undefined) {
            return [];
        }

        return selectedSearchItemWithSections.sectionsMatchingOrigin.map((section) => {
            const conflicts = conflictSectionPairs
                // get conflicts involving current section
                .filter((sectionPair) => sectionPair[0].CRN === section.CRN || sectionPair[1].CRN === section.CRN)
                // get the other section from the pair
                .map((sectionPair) => sectionPair[0].CRN === section.CRN ? sectionPair[1] : sectionPair[0]);

            const isManaged = isSectionManaged(section, selectedSearchItemWithSections, managedSections);
            const isSelected = isSectionSelected(section, selectedSearchItemWithSections.selectedCrns);
            const isUnavailable = isSectionUnavailable(section,
                selectedSearchItemWithSections.selectedSectionsInSearchItem);
            const isVisible = isSectionVisible(section, selectedSearchItemWithSections, isSelected,
                isUnavailable, isAdvanced, filterTime);

            return {
                ...section,
                conflicts,
                isManaged,
                isSelected,
                isUnavailable,
                isVisible,
            };
        });
    },
);
