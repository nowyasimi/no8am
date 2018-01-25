import * as React from "react";

import {MapDispatchToProps, MapStateToProps} from "react-redux";

import {connect} from "../Connect";
import {getSearchItemsWithBaseAbbreviations} from "../Helpers";

import { Classes, Switch, Tab2, Tabs2 } from "@blueprintjs/core";
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
                key={`${currentSearchItem.currentItemCourseAbbreviation}${currentSearchItem.originItemAbbreviation}`}
                searchItem={currentSearchItem}
            />
        ));
    }
}

function mapStateToProps(state: IAllReducers): ICourseCardStateProps {
    return {
        searchItems: getSearchItemsWithBaseAbbreviations(state),
    };
}
