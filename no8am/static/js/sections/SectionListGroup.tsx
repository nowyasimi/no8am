import * as React from "react";

import {SectionWithUIProperties} from "../Interfaces";

import SectionListCard from "./SectionListCard";
import SectionListGroupTag from "./SectionListGroupTag";
import SectionListManagedCard from "./SectionListManagedCard";

interface ISectionListGroupProps {
    sectionsInGroup: SectionWithUIProperties[];
}

export default class SectionListGroup extends React.Component<ISectionListGroupProps> {

    public render() {
        if (this.props.sectionsInGroup.every((section) => section.isManaged)) {
            const bareCourse = this.props.sectionsInGroup[0].departmentAndBareCourse;
            return [this.createHeader(bareCourse), (
                <SectionListManagedCard
                    key={bareCourse}
                    managedAbbreviation={bareCourse}
                />
            )];
        } else {
            // only add a margin to the bottom of a section group if at least one card in the group is visible
            const allHidden = this.props.sectionsInGroup.every((section) => !section.isVisible);
            const course = this.props.sectionsInGroup[0].departmentAndCourse;

            const sectionCards = this.props.sectionsInGroup.map((section, index) => (
                <SectionListCard
                    key={section.CRN}
                    section={section}
                    addMargin={!allHidden && index === this.props.sectionsInGroup.length - 1}
                    isManaged={section.isManaged}
                    isSelected={section.isSelected}
                    isUnavailable={section.isUnavailable}
                    isVisible={section.isVisible}
                />));

            return allHidden ? sectionCards : [this.createHeaderWithDetails(course), ...sectionCards];
        }
    }

    private createHeaderWithDetails(headerName: string) {
        const numberOfVisibleSections = this.props.sectionsInGroup
            .reduce((previousVisibleCount: number, section) => previousVisibleCount + (section.isVisible ? 1 : 0), 0);

        const numberOfSectionsString = numberOfVisibleSections === this.props.sectionsInGroup.length ?
            "all" : `${numberOfVisibleSections} out of ${this.props.sectionsInGroup.length}`;

        const sectionWithConflicts = this.props.sectionsInGroup.find((section) => section.conflicts.length > 0);
        const seenConflictCourses = new Set();
        const conflictCourses: JSX.Element[] = [];

        if (sectionWithConflicts !== undefined) {
            sectionWithConflicts.conflicts.forEach((conflictCourse) => {
                if (!seenConflictCourses.has(conflictCourse.departmentAndCourse)) {
                    conflictCourses.push(<SectionListGroupTag section={conflictCourse} />);
                    seenConflictCourses.add(conflictCourse.departmentAndCourse);
                }
            });
        }

        const conflictsString = conflictCourses.length === 0 ? "" :
            `The current selection conflicts with: `;

        return (
            <div>
                {this.createHeader(headerName)}
                {`Showing ${numberOfSectionsString} sections. ${conflictsString}`}
                {conflictCourses}
            </div>
        );
    }

    private createHeader(headerName: string) {
        return <h4 key={headerName + "header"}>{headerName}</h4>;
    }

}
