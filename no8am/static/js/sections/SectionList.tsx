import * as React from "react";
import {connect} from "react-redux";
import {createSelector} from "reselect";

import {getAllSections, getSectionsForSelectedSearchItem,
        getSelectedSearchItemMemoized, getUniqueCCCs} from "../Helpers";
import {FilterTime, IAllReducers, ISearchItem, Section, SectionWithUIProperties} from "../Interfaces";

import GlobalFilters from "../filters/GlobalFilters";
import LookupFilters from "../filters/LookupFilters";
import {getSelectedSectionsForSearchItem} from "../sections/SectionReducer";
import SectionListGroup from "./SectionListGroup";

interface ISectionListProps {
    searchItem: ISearchItem;
}

interface ISectionListStateProps {
    availableCCCs: string[];
    filterTime: FilterTime;
    sections: SectionWithUIProperties[];
    selectedSections: Section[];
}

class SectionList extends React.Component<ISectionListStateProps & ISectionListProps> {

    public render() {

        // TODO - fix cache time
        // const cacheTime = this.props.data.cache_time || new Date();

        const sectionCards = this.groupSectionsByType()
            .map((sectionGroup) => (
                <div key={sectionGroup[0].departmentAndCourse}>
                    <SectionListGroup sectionsInGroup={sectionGroup} />
                </div>
            ));

        const visibleCount = this.props.sections.reduce((previousVisibleCount: number, section) =>
            previousVisibleCount + (section.isVisible ? 1 : 0), 0);

        return (
            <div className="sectionList">
                <GlobalFilters />
                <LookupFilters
                    filterTime={this.props.filterTime}
                    searchItem={this.props.searchItem}
                    numberOfSectionsVisible={visibleCount}
                    numberOfSectionsTotal={this.props.sections.length}
                />
                {sectionCards}
            </div>
        );
    }

    private groupSectionsByType() {
        return this.props.sections.reduce((groupedSections: SectionWithUIProperties[][],
                                           currentSection: SectionWithUIProperties) => {
            const lastSectionGroup = groupedSections.slice(-1).pop();
            const otherSectionGroups = groupedSections.slice(0, -1);

            if (lastSectionGroup === undefined) {
                // first iteration, create a new section group
                return [[currentSection]];
            } else if (lastSectionGroup[0].departmentAndCourse === currentSection.departmentAndCourse ||
                       (lastSectionGroup[0].departmentAndBareCourse === currentSection.departmentAndBareCourse &&
                        lastSectionGroup[0].isManaged && currentSection.isManaged)) {
                // add section to last section group
                return [...otherSectionGroups, [...lastSectionGroup, currentSection]];
            } else {
                // create a new section group
                return [...groupedSections, [currentSection]];
            }
        }, []);
    }
}

const getSelectedSectionsForSelectedCourseCard = createSelector(
    [getAllSections, getSelectedSearchItemMemoized],
    // filter all sections by sections that match selected crns for the current card
    getSelectedSectionsForSearchItem,
);

const getFilterCCCs = (state: IAllReducers) => state.filters.filterCCCs;

const getAvailableCCCs = createSelector(
    [getFilterCCCs, getUniqueCCCs],
    (filterCCCs, uniqueCCCs) => filterCCCs.length === 0 ? uniqueCCCs : filterCCCs,
);

const SectionListConnected = connect(
    (state: IAllReducers): ISectionListStateProps => ({
        availableCCCs: getAvailableCCCs(state),
        filterTime: state.filters.filterTime,
        sections: getSectionsForSelectedSearchItem(state),
        selectedSections: getSelectedSectionsForSelectedCourseCard(state),
    }),
)(SectionList);

export default SectionListConnected;
