import * as React from "react";

import {bindActionCreators, Dispatch} from "redux";

import {connect} from "../Connect";

import {Classes, Icon, IconClasses, Tag} from "@blueprintjs/core";
import * as classNames from "classnames";
import MediaQuery from "react-responsive";

import {CalendarSectionColorType, colorMapping} from "../Constants";
import {IAllReducers, ISearchItemWithMatchingSections} from "../Interfaces";
import {clickCourseCard, returnOfClickCourseCard} from "../sections/SectionActions";

const cardStyle = {
    flex: "1 0 auto",
    margin: "10px",
    maxWidth: "50%",
    minWidth: "30%",
    padding: "0px 10px 0px 10px",
};

const titleStyle = {
    fontSize: "16px",
};

const tickStyle = {
    float: "right",
    paddingRight: "3px",
};

const sectionTagStyle = {
    float: "right",
    lineHeight: "14px",
};

interface ICourseCard {
    searchItem: ISearchItemWithMatchingSections;
}

interface ICourseCardDispatchProps {
    onClickCourseCard: () => typeof returnOfClickCourseCard;
}

@connect<{}, ICourseCardDispatchProps, ICourseCard>(null, mapDispatchToProps)
export class CourseCard extends React.Component<ICourseCard & ICourseCardDispatchProps> {

    public render() {
        const classes = classNames({
            [Classes.CARD]: true,
            [Classes.INTERACTIVE]: true,
            [Classes.ELEVATION_4]: this.props.searchItem.isSelected,
        });

        const cardStyleWithColor = {
            ...cardStyle,
            borderLeft: `8px solid ${colorMapping[this.props.searchItem.color][CalendarSectionColorType.SELECTED]}`,
        };

        return (
            <div
                className={classes}
                style={cardStyleWithColor}
                onClick={this.props.onClickCourseCard}
            >
                <h5 style={titleStyle}>{this.formatTitle()}</h5>
                <p>{this.formatAbbreviations()}</p>
            </div>
        );
    }

    private formatTitle() {
        if (this.props.searchItem.currentItemCourseAbbreviation !== null &&
            this.props.searchItem.originItemAbbreviation === null) {
            return this.props.searchItem.currentItemCourseAbbreviation;
        } else if (this.props.searchItem.currentItemCourseAbbreviation !== null &&
            this.props.searchItem.originItemAbbreviation !== null) {
            return this.props.searchItem.currentItemCourseAbbreviation
            + ` (from ${this.props.searchItem.originItemAbbreviation})`;
        } else {
            return this.props.searchItem.originItemAbbreviation;
        }
    }

    private formatAbbreviations() {
        const selectedAbbreviations = this.getSelectedAbbreviations();

        return this.filterAbbreviations().map((abbreviation) =>
             this.createAbbreviation(abbreviation, selectedAbbreviations),
        );
    }

    private createAbbreviation(abbreviation: string, selectedAbbreviations: string[]) {
        const selectedIcon = selectedAbbreviations.find((currentAbbreviation) =>
            abbreviation === currentAbbreviation) !== undefined ?
            <Icon style={tickStyle} iconName={IconClasses.TICK} /> : null;

        const numberOfSections = this.props.searchItem.sectionsInSearchItem.filter(
            (section) => section.departmentAndCourse === abbreviation).length;

        const numberOfSectionsTag = (
            <span>
                <MediaQuery minWidth={900}>
                    <Tag style={sectionTagStyle}> {numberOfSections} Sections </Tag>
                </MediaQuery>
                <MediaQuery maxWidth={900}>
                    <Tag style={sectionTagStyle}> {numberOfSections} </Tag>
                </MediaQuery>
            </span>
        );

        return <span key={abbreviation}>{abbreviation} {numberOfSectionsTag} {selectedIcon} <br /></span>;
    }

    private getSelectedAbbreviations(): string[] {
        return this.props.searchItem.selectedCrns
            .map((crn) => this.props.searchItem.sectionsInSearchItem.find((section) => section.CRN === crn))
            .map((section) => section === undefined ? section : section.departmentAndCourse)
            .filter((section): section is string => section !== undefined);
    }

    /**
     * Creates a list of abbreviations for a given base abbreviation. The purpose of this is to group
     * different section types for the same course in a single card. Individual section types will not return
     * a detailed list of abbreviations.
     * For example, if the searchItem is for CHEM 201, this method will return ["CHEM 201", "CHEM 201R", "CHEM 201L"]
     * If the search item is for CSCI, this method will return []
     * @param searchItem Contains the course, department, etc depending on the search type
     * @param allSections Array of all sections
     */
    private filterAbbreviations() {
        return this.props.searchItem.currentItemCourseAbbreviation !== null ?
            [...new Set(this.props.searchItem.sectionsInSearchItem
                .map((section) => section.departmentAndCourse))] :
            [];
    }
}

function mapDispatchToProps(dispatch: Dispatch<IAllReducers>, ownProps: ICourseCard): ICourseCardDispatchProps {
    return bindActionCreators({
        onClickCourseCard: () => clickCourseCard(ownProps.searchItem),
    }, dispatch);
}
