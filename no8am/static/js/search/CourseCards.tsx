import * as React from "react";
import {connect} from "react-redux";

import {getConflictCrns, getSearchItemsWithSections} from "../Helpers";
import {IAllReducers, ISearchItemWithMatchingSections} from "../Interfaces";
import CourseCard from "./CourseCard";

const cardContainerStyle: React.CSSProperties = {
    display: "flex",
    flexWrap: "wrap",
};

interface ICourseCardStateProps {
    conflictCrns: string[];
    searchItems: ISearchItemWithMatchingSections[];
}

class CourseCards extends React.Component<ICourseCardStateProps> {

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
                allConflicts={this.props.conflictCrns}
                key={`${currentSearchItem.currentItemCourseAbbreviation}${currentSearchItem.originItemAbbreviation}`}
                searchItem={currentSearchItem}
            />
        ));
    }
}

const CourseCardsConnected = connect(
    (state: IAllReducers): ICourseCardStateProps => ({
        conflictCrns: getConflictCrns(state),
        searchItems: getSearchItemsWithSections(state),
    }),
)(CourseCards);

export default CourseCardsConnected;
