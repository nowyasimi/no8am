import * as React from "react";

import {connect} from "../Connect";

import {getAllManagedSections, getFilterCourseForSelectedCourseCard, getSectionsForSearchItem,
        getSelectedSectionsForSelectedCourseCard} from "../Helpers";
import {IAllReducers, ISearchItem, ISectionExtra, Section} from "../Interfaces";

import GlobalFilters from "../filters/GlobalFilters";
import LookupFilters from "../filters/LookupFilters";
import SectionListCard from "./SectionListCard";

interface ISectionListProps {
    searchItem: ISearchItem;
}

interface ISectionListStateProps {
    // filterCourse: string | null;
    filterTime: [number, number];
    isAdvanced: boolean;
    managedSections: Section[];
    sections: Section[];
    selectedSections: Section[];
}

@connect<ISectionListStateProps, {}, ISectionListProps>(mapStateToProps)
export default class SectionList extends React.Component<ISectionListStateProps & ISectionListProps> {

    public render() {

        // TODO - fix cache time
        // const cacheTime = this.props.data.cache_time || new Date();

        let visibleCount = 0;

        const sectionCards = this.props.sections.map((section) => {
            const isVisible = this.isVisible(section);
            visibleCount = isVisible ? visibleCount + 1 : visibleCount;

            return (
                <SectionListCard
                    key={section.CRN}
                    section={section}
                    isLastOfType={this.isLastOfType(section, isVisible)}
                    isManaged={this.isManaged(section)}
                    isSelected={this.isSelected(section)}
                    isUnavailable={this.isUnavailable(section)}
                    isVisible={isVisible}
                />
            );
        });

        return (
            <div className="sectionList">
                <GlobalFilters />
                <LookupFilters
                    filterTime={this.props.filterTime}
                    item={this.props.searchItem}
                    numberOfSectionsVisible={visibleCount}
                    numberOfSectionsTotal={sectionCards.length}
                    originAbbreviation={this.props.searchItem.originItemAbbreviation}
                />
                {sectionCards}
            </div>
        );
    }

    // separates different types of sections in the section list
    private isLastOfType(section: Section, isVisible: boolean): boolean {
        const lastSectionOfType = this.props.sections.filter((maybeSectionOfType) => isVisible &&
            this.isVisible(maybeSectionOfType) &&
            maybeSectionOfType.departmentAndCourse === section.departmentAndCourse).pop();

        return lastSectionOfType !== undefined && lastSectionOfType.CRN === section.CRN;
    }

    // handles case when another course card contains the course baseAbbreviation
    private isManaged(section: Section): boolean {
        return this.props.managedSections.find((managedSection) => managedSection.CRN === section.CRN) !== undefined;
    }

    // highlights selected sections and used to flag when a user selects an unavailable section
    private isSelected(section: Section): boolean {
        return this.props.selectedSections.find((selectedSection) => selectedSection.CRN === section.CRN) !== undefined;
    }

    // identifies if a section cannot be selected based on other selected sections
    private isUnavailable(section: Section): boolean {
        return this.props.selectedSections.find((selectedSection) =>
            section.departmentAndBareCourse === selectedSection.departmentAndBareCourse &&
            (section.main && !selectedSection.main &&
                !(selectedSection as ISectionExtra).dependent_main_sections.includes(section.sectionNum)) ||
            (!section.main && selectedSection.main &&
                !(section as ISectionExtra).dependent_main_sections.includes(selectedSection.sectionNum)))
            !== undefined;
    }

    private isVisible(section: Section): boolean {
        // show sections despite registrar restrictions if advanced mode is enabled
        return ((this.props.isAdvanced || !this.isUnavailable(section)) &&
                (this.props.searchItem.originItemAbbreviation === null ||
                 this.props.searchItem.currentItemBaseAbbreviation === section.departmentAndBareCourse) &&
                (section.meetingTimes.every((meetingTime) => meetingTime.startTime >= this.props.filterTime[0] &&
                                      meetingTime.duration + meetingTime.startTime <= this.props.filterTime[1])) ||
                 this.props.selectedSections.find((selectedSection) => selectedSection.CRN === section.CRN)
               ) !== undefined;
    }
}

function mapStateToProps(state: IAllReducers): ISectionListStateProps {
    return {
        // TODO - add button to revert back to filter course
        // filterCourse: getFilterCourseForSelectedCourseCard(state),
        filterTime: state.filters.filterTime,
        isAdvanced: state.filters.isAdvanced,
        managedSections: getAllManagedSections(state),
        sections: getSectionsForSearchItem(state),
        selectedSections: getSelectedSectionsForSelectedCourseCard(state),
    };
}
