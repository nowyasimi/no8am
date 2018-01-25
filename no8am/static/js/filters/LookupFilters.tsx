import * as React from "react";
import {bindActionCreators, Dispatch} from "redux";

import {Button, Classes} from "@blueprintjs/core";
import * as classNames from "classnames";

import {connect} from "../Connect";
import {IAllReducers, ISearchItem} from "../Interfaces";
import {clickDoneSelecting, returnOfClickDoneSelecting,
        returnOfRevertToOriginAbbreviation, revertToOriginAbbreviation} from "../sections/SectionActions";
import FilterTime from "./FilterTime";

interface ILookupFiltersProps {
    filterTime: any;
    searchItem: ISearchItem;
    numberOfSectionsVisible: number;
    numberOfSectionsTotal: number;
}

interface ILookupFiltersDispatchProps {
    onClickDoneSelecting: () => typeof returnOfClickDoneSelecting;
    onRevertToOriginAbbreviation: () => typeof returnOfRevertToOriginAbbreviation;
}

@connect<{}, ILookupFiltersDispatchProps, ILookupFiltersProps>((state: IAllReducers) => ({}), mapDispatchToProps)
export default class LookupFilters extends React.Component<ILookupFiltersDispatchProps & ILookupFiltersProps> {

    public render() {
        // TOOD add buttons for done selecting and to duplicate current search item
        // const isFromCategorySearch = this.props.item.searchItemType !== SearchItemType.Course &&
        //                        this.props.item.searchItemType !== SearchItemType.Department;

        const sectionFilterString = this.props.numberOfSectionsVisible === this.props.numberOfSectionsTotal ? "all" :
            `${this.props.numberOfSectionsVisible} out of ${this.props.numberOfSectionsTotal}`;

        return (
            <div className="filters">
                <div>
                    Showing {sectionFilterString} sections
                </div>
                <FilterTime filterTime={this.props.filterTime} />
                {this.renderButtons()}
            </div>
        );
    }

    private renderButtons() {
        return (
            <div>
                {this.renderOriginAbbreviationButtons()}
                <Button
                    text={`Done selecting`}
                    onClick={this.props.onClickDoneSelecting}
                />
            </div>
        );

    }

    private renderOriginAbbreviationButtons() {
        if (this.props.searchItem.originItemAbbreviation !== null) {
            const classes = classNames({
                [Classes.DISABLED]: this.props.searchItem.currentItemCourseAbbreviation === null,
            });

            return [(
                <Button
                    className={classes}
                    text={`Revert to ${this.props.searchItem.originItemAbbreviation}`}
                    onClick={this.props.onRevertToOriginAbbreviation}
                />), (
                <Button
                    className={classes}
                    text={`Search again for ${this.props.searchItem.originItemAbbreviation}`}
                />),
            ];
        }
    }
}

function mapDispatchToProps(dispatch: Dispatch<IAllReducers>): ILookupFiltersDispatchProps {
    return bindActionCreators({
        onClickDoneSelecting: clickDoneSelecting,
        onRevertToOriginAbbreviation: revertToOriginAbbreviation,
        // onSearchAgainForAbbreviation: searchAgainForAbbreviation,
    }, dispatch);
}
