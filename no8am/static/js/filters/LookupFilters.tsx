import * as React from "react";
import {bindActionCreators, Dispatch} from "redux";

import {Button, Classes} from "@blueprintjs/core";
import * as classNames from "classnames";

import {connect} from "../Connect";
import {IAllReducers, ISearchItem} from "../Interfaces";
import {clickDoneSelecting, removeSearch, returnOfClickDoneSelecting, returnOfRemoveSearch,
        returnOfRevertToOriginAbbreviation, returnOfSearchAgainForAbbreviation, revertToOriginAbbreviation,
        searchAgainForAbbreviation} from "../sections/SectionActions";
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
    onSearchAgainForAbbreviation: () => typeof returnOfSearchAgainForAbbreviation;
    onRemoveSearch: () => typeof returnOfRemoveSearch;
}

@connect<{}, ILookupFiltersDispatchProps, ILookupFiltersProps>((state: IAllReducers) => ({}), mapDispatchToProps)
export default class LookupFilters extends React.Component<ILookupFiltersDispatchProps & ILookupFiltersProps> {

    public render() {
        const {originItemAbbreviation, currentItemCourseAbbreviation} = this.props.searchItem;

        const sectionFilterString = this.props.numberOfSectionsVisible === this.props.numberOfSectionsTotal ? "all" :
            `${this.props.numberOfSectionsVisible} out of ${this.props.numberOfSectionsTotal}`;

        const sectionFilterSentence = `Showing ${sectionFilterString} sections for ` +
            `${originItemAbbreviation === null ? currentItemCourseAbbreviation : originItemAbbreviation}`;

        return (
            <div className="filters">
                <div>
                    {sectionFilterSentence}
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
                <Button
                    text={`Remove search`}
                    onClick={this.props.onRemoveSearch}
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
                    onClick={this.props.onSearchAgainForAbbreviation}
                />),
            ];
        }
    }
}

function mapDispatchToProps(dispatch: Dispatch<IAllReducers>): ILookupFiltersDispatchProps {
    return bindActionCreators({
        onClickDoneSelecting: clickDoneSelecting,
        onRemoveSearch: removeSearch,
        onRevertToOriginAbbreviation: revertToOriginAbbreviation,
        onSearchAgainForAbbreviation: searchAgainForAbbreviation,
    }, dispatch);
}
