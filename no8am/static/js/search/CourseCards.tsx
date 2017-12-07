import * as React from "react";

import {MapDispatchToProps, MapStateToProps} from "react-redux";
import {createSelector} from "reselect";

import {connect} from "../Connect";

import { Classes, Switch, Tab2, Tabs2 } from "@blueprintjs/core";
import {SEARCH_ITEM_TYPE} from "../Constants";
import {IAllReducers, ISearchItem, ISearchItemWithAllAbbreviations, ISection} from "../Interfaces";
import {CourseCard} from "./CourseCard";

const cardContainerStyle: React.CSSProperties = {
    display: "flex",
    flexWrap: "wrap",
};

interface ICourseCardStateProps {
    searchItems: ISearchItemWithAllAbbreviations[];
}

@connect<ICourseCardStateProps, {}, ICourseCardStateProps>(mapStateToProps)
export default class CourseCards extends React.Component<ICourseCardStateProps> {

    public render() {
        return (
            <div style={cardContainerStyle}>
                {this.createCourseCards()}
            </div>
        );
    }

    private createCourseCards() {
        return this.props.searchItems.map((currentSearchItem) => (
            <CourseCard
                key={`${currentSearchItem.currentItemBaseAbbreviation}${currentSearchItem.originItemAbbreviation}`}
                searchItem={currentSearchItem}
            />
        ));
    }
}

/**
 * Creates a list of abbreviations that will get grouped together in a single card. The purpose of this is to group
 * different section types for the same course in a single card.
 * @param baseAbbreviation Abbreviation to search for in list of all sections
 */
const getAllAbbreviations = (baseAbbreviation: string, allSections: ISection[]): string[] => {
    const sectionsWithBaseAbbreviation = allSections.filter(
        (section: ISection) => section.departmentAndBareCourse === baseAbbreviation)
        .map((section) => section.departmentAndCourse);

    if (sectionsWithBaseAbbreviation.length === 0) {
        return [baseAbbreviation];
    } else {
        return [...new Set(sectionsWithBaseAbbreviation)];
    }
};

const getSearchItems = (state: IAllReducers): ISearchItem[] => state.sections.searchItems;
const getAllSections = (state: IAllReducers): ISection[] => state.sections.allSections;

const getSearchItemsWithBaseAbbreviations = createSelector(
    [getSearchItems, getAllSections],
    (searchItems, allSections) => (
        searchItems.map((currentSearchItem) => ({
            ...currentSearchItem,
            currentItemAllAbbreviations: getAllAbbreviations(
                currentSearchItem.currentItemBaseAbbreviation, allSections),
        }))
    ),
);

function mapStateToProps(state: IAllReducers): ICourseCardStateProps {
    return {
        searchItems: getSearchItemsWithBaseAbbreviations(state),
    };
}
