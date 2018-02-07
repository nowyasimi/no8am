import * as React from "react";

import {connect} from "../Connect";

import {getSearchItemsWithSections} from "../Helpers";
import {IAllReducers, ISearchItemWithMatchingSections} from "../Interfaces";
import {CourseCard} from "./CourseCard";

const cardContainerStyle: React.CSSProperties = {
    display: "flex",
    flexWrap: "wrap",
};

interface ICourseCardStateProps {
    searchItems: ISearchItemWithMatchingSections[];
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
                key={`${currentSearchItem.currentItemCourseAbbreviation}${currentSearchItem.originItemAbbreviation}`}
                searchItem={currentSearchItem}
            />
        ));
    }
}

function mapStateToProps(state: IAllReducers): ICourseCardStateProps {
    return {
        searchItems: getSearchItemsWithSections(state),
    };
}
