import * as React from "react";

import {Callout, IconName, Intent} from "@blueprintjs/core";
import {IconNames} from "@blueprintjs/icons";

import {SectionWithUIProperties} from "../Interfaces";

import SectionListCard from "./SectionListCard";
import SectionListGroupTag from "./SectionListGroupTag";
import SectionListManagedCard from "./SectionListManagedCard";

const calloutStyle: React.CSSProperties = {
    marginBottom: "10px",
};

interface ISectionListGroupProps {
    sectionsInGroup: SectionWithUIProperties[];
}

export default class SectionListGroup extends React.Component<ISectionListGroupProps> {
    public render() {
        if (this.props.sectionsInGroup.every((section) => section.isManaged)) {
            const bareCourse = this.props.sectionsInGroup[0].departmentAndBareCourse;
            return (
                <Callout
                    title={bareCourse}
                    style={calloutStyle}
                >
                    <SectionListManagedCard
                        key={bareCourse}
                        managedAbbreviation={bareCourse}
                    />
                </Callout>
            );
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

            const conflictsElements = this.createConflictsElements();

            let calloutIcon: IconName;
            let intent: Intent;

            if (conflictsElements.length > 0) {
                calloutIcon = IconNames.WARNING_SIGN;
                intent = Intent.DANGER;
            } else if (this.props.sectionsInGroup.find((section) => section.isSelected) !== undefined) {
                calloutIcon = IconNames.TICK_CIRCLE;
                intent = Intent.SUCCESS;
            } else {
                calloutIcon = IconNames.CIRCLE;
                intent = Intent.NONE;
            }

            return (
                <Callout
                    icon={calloutIcon}
                    intent={intent}
                    title={course}
                    style={calloutStyle}
                >
                    {[this.createSectionCountMessage(), ...conflictsElements, ...sectionCards]}
                </Callout>
            );
        }
    }

    private createSectionCountMessage() {
        const numberOfVisibleSections = this.props.sectionsInGroup
            .reduce((previousVisibleCount: number, section) => previousVisibleCount + (section.isVisible ? 1 : 0), 0);

        const numberOfSectionsString = numberOfVisibleSections === this.props.sectionsInGroup.length ?
            "all" : `${numberOfVisibleSections} out of ${this.props.sectionsInGroup.length}`;

        return (
            <span>
                {`Showing ${numberOfSectionsString} sections.`}
            </span>
        );
    }

    private createConflictsElements() {
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

        return conflictCourses.length === 0 ? [] :
            [<span key="conflictsTitle">The current selection conflicts with:</span>, ...conflictCourses];
    }

}
