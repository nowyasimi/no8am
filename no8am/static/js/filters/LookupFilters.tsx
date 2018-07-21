import * as React from "react";

import {FilterTime as FilterTimeType, ISearchItem} from "../Interfaces";
import FilterTime from "./FilterTime";

interface ILookupFiltersProps {
    filterTime: FilterTimeType;
    searchItem: ISearchItem;
    numberOfSectionsVisible: number;
    numberOfSectionsTotal: number;
}

interface ILookupFiltersState {
    isConfirmRevertDialogOpen: boolean;
    doNotAskToConfirmRevertAgain: boolean;
}

export default class LookupFilters extends React.Component<ILookupFiltersProps, ILookupFiltersState> {

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
                {/* <FilterCCC /> */}
            </div>
        );
    }
}
