import * as React from "react";
import {bindActionCreators, Dispatch} from "redux";

import {Button, Classes, Position} from "@blueprintjs/core";

import {connect} from "../Connect";
import {SearchItemType} from "../Constants";
import {IAllReducers, ISearchItem} from "../Interfaces";
import {returnOfRevertToOriginAbbreviation, revertToOriginAbbreviation} from "../sections/SectionActions";
import FilterTime from "./FilterTime";

interface ILookupFiltersProps {
    filterTime: any;
    item: ISearchItem;
    originAbbreviation: string | null;
    numberOfSectionsVisible: number;
    numberOfSectionsTotal: number;
}

interface ILookupFiltersDispatchProps {
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
                {this.renderOriginAbbreviationButtons()}
            </div>
        );
    }

    private renderOriginAbbreviationButtons() {
        if (this.props.originAbbreviation !== null) {
            return (
                <div>
                    <Button
                        text={`Revert to ${this.props.originAbbreviation}`}
                        onClick={this.props.onRevertToOriginAbbreviation}
                    />
                    <Button
                        text={`Search again for ${this.props.originAbbreviation}`}
                    />
                </div>
            );
        }
    }
}

function mapDispatchToProps(dispatch: Dispatch<IAllReducers>): ILookupFiltersDispatchProps {
    return bindActionCreators({
        onRevertToOriginAbbreviation: revertToOriginAbbreviation,
    }, dispatch);
}
