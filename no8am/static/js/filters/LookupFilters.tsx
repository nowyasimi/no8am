import * as React from "react";

import {FilterTime as FilterTimeType} from "../Interfaces";
import FilterTime from "./FilterTime";

interface ILookupFiltersProps {
    filterTime: FilterTimeType;
}

interface ILookupFiltersState {
    isConfirmRevertDialogOpen: boolean;
    doNotAskToConfirmRevertAgain: boolean;
}

export default class LookupFilters extends React.Component<ILookupFiltersProps, ILookupFiltersState> {

    public render() {
        return (
            <div className="filters">
                <FilterTime filterTime={this.props.filterTime} />
                {/* <FilterCCC /> */}
            </div>
        );
    }
}
