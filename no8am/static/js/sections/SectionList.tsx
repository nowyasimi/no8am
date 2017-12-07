import * as React from "react";
import {connect} from "react-redux";

import {SEARCH_ITEM_TYPE} from "../Constants";
import {IAllReducers, ISection} from "../Interfaces";

import GlobalFilters from "../filters/GlobalFilters";
import LookupFilters from "../filters/LookupFilters";
import SectionListCard from "./SectionListCard";

interface ISectionListProps {
    data: any;
    item: any;
    selectedSections: ISection[];
    isAdvanced: boolean;
    askShowSingleCourse: string;
    showSingleCourse: string;
    singleCourseOrigin: string;
    isFromCategorySearch: boolean;
    filterTime: [number, number];
}

@(connect(mapStateToProps, mapDispatchToProps) as any)
export default class SectionList extends React.Component<ISectionListProps, undefined> {

    public render() {
        const cacheTime = this.props.data.cache_time || new Date();
        const searchItem = this.props.item;
        const sections: ISection[] = this.props.data;
        const isFromCategorySearch = this.props.item.itemType != SEARCH_ITEM_TYPE.Course &&
                               this.props.item.itemType != SEARCH_ITEM_TYPE.Department;

        let visibleCount = 0;

        let sectionCards = sections.map(section => {

            let isVisible = this.isVisible(section);

            visibleCount = isVisible ? visibleCount + 1 : visibleCount;

            let lastSectionOfType = sections.filter(maybeSectionOfType => isVisible && this.isVisible(maybeSectionOfType) &&
                maybeSectionOfType.departmentAndCourse == section.departmentAndCourse).pop();

            let isLastOfType = lastSectionOfType != undefined && lastSectionOfType.CRN == section.CRN;

            return (<SectionListCard
                        key={section.CRN}
                        {...section}
                        isLastOfType={isLastOfType}
                        isSelected={this.props.selectedSections.find(selectedSection => selectedSection.CRN == section.CRN) != undefined}
                        isUnavailable={this.isUnavailable(section)}
                        isVisible={isVisible}
                        shouldAskShowSingleCourse={section.departmentAndCourse == this.props.askShowSingleCourse && isLastOfType}
                        isFromCategorySearch={isFromCategorySearch} />
                   );
        });

        return (
            <div className="sectionList">
                <GlobalFilters />
                <LookupFilters 
                    showSingleCourse={this.props.showSingleCourse}
                    singleCourseOrigin={this.props.singleCourseOrigin}
                    filterTime={this.props.filterTime} 
                    item={this.props.item} 
                    numberOfSectionsVisible={visibleCount}
                    numberOfSectionsTotal={sections.length}
                    />
                {sectionCards}
            </div>
        );
    }

    private isUnavailable(section: ISection): boolean {
        return this.props.selectedSections.find((selectedSection) =>
            section.departmentAndBareCourse === selectedSection.departmentAndBareCourse &&
            ((section.main && !selectedSection.main &&
                !selectedSection.dependent_main_sections.includes(section.sectionNum)) ||
            (!section.main && selectedSection.main &&
                !section.dependent_main_sections.includes(selectedSection.sectionNum)))) !== undefined;
    }

    private isVisible(section: ISection): boolean {
        return ((this.props.isAdvanced || !this.isUnavailable(section)) &&
                (this.props.showSingleCourse === null ||
                 this.props.showSingleCourse === section.departmentAndBareCourse) &&
                (section.daysMet.every((meetingTime) => meetingTime[1] >= this.props.filterTime[0] &&
                                        meetingTime[2] + meetingTime[1] <= this.props.filterTime[1]))) ||
               this.props.selectedSections.find((selectedSection) => selectedSection.CRN === section.CRN) !== undefined;
    }
}

// Map Redux state to component props
function mapStateToProps(state: IAllReducers) {
    return {
        allSections: state.sections.allSections,
        askShowSingleCourse: state.askShowSingleCourse,
        filterTime: state.filter.filterTime,
        isAdvanced: state.filter.isAdvanced,
        selectedSections: state.sections.selectedSections,
        showSingleCourse: state.showSingleCourse,
        singleCourseOrigin: state.singleCourseOrigin,
    }
}

// Map Redux actions to component props
function mapDispatchToProps(dispatch) {
    return {
    }
}
