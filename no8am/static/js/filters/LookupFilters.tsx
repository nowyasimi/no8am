import * as React from "react";
import {connect} from "react-redux";

import {Classes, Tag} from "@blueprintjs/core";

import {SEARCH_ITEM_TYPE} from "../Constants";
import {clickRemoveShowSingleCourse} from "./FilterActions";
import FilterTime from "./FilterTime";

interface ILookupFiltersProps {
    showSingleCourse: string;
    singleCourseOrigin: string;
    filterTime: any;
    item: any;
    numberOfSectionsVisible: number;
    numberOfSectionsTotal: number;
    onClickRemoveShowSingleCourse?: () => Promise<void>;
}

/* tslint:disable:no-empty */
@(connect(() => {}, mapDispatchToProps) as any)
export default class LookupFilters extends React.Component<ILookupFiltersProps, undefined> {

    public render() {
        const isFromCategorySearch = this.props.item.itemType !== SEARCH_ITEM_TYPE.Course &&
                               this.props.item.itemType !== SEARCH_ITEM_TYPE.Department;

        const showSingleCourseTag = this.props.showSingleCourse == null ? null : (
            <Tag className={Classes.LARGE} onRemove={this.props.onClickRemoveShowSingleCourse}>
                {this.props.singleCourseOrigin} => {this.props.showSingleCourse}
            </Tag>
        );

        const sectionFilterString = this.props.numberOfSectionsVisible === this.props.numberOfSectionsTotal ? "all" :
            `${this.props.numberOfSectionsVisible} out of ${this.props.numberOfSectionsTotal}`;

        return (
            <div className="filters">
                <div>
                    Showing {sectionFilterString} sections
                </div>
                {showSingleCourseTag}
                <FilterTime filterTime={this.props.filterTime} />
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return {
        onClickRemoveShowSingleCourse: () => dispatch(clickRemoveShowSingleCourse())
    };
}
