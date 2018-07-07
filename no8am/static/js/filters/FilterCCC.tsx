import * as React from "react";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";

import {Classes, MenuItem} from "@blueprintjs/core";
import {IItemRendererProps, MultiSelect} from "@blueprintjs/select";
import * as classNames from "classnames";

import {getUniqueCCCs} from "../Helpers";
import {IAllReducers} from "../Interfaces";

import {updateFilterCCC} from "./FilterActions";

interface IFilterCCCStateProps {
    filterCCCs: string[];
    allCCCs: string[];
}

interface IFilterCCCDispatchProps {
    onUpdateFilterCCC: (filterCCC: string[]) => void;
}

class FilterCCC extends React.Component<IFilterCCCStateProps & IFilterCCCDispatchProps> {

    public render() {
        return (
            <MultiSelect
                itemPredicate={this.itemPredicate}
                itemRenderer={this.itemRenderer}
                items={this.props.allCCCs}
                onItemSelect={this.addCCCToFilter}
                selectedItems={this.props.filterCCCs}
                tagInputProps={{inputProps: {id: "filterCCCPopover"}, onRemove: this.removeCCCFromFilter}}
                tagRenderer={this.tagRenderer}
            />
        );
    }

    private itemRenderer = (item: string, {modifiers, handleClick}: IItemRendererProps) => {
        const classes = classNames({
            [Classes.ACTIVE]: modifiers.active,
            [Classes.INTENT_PRIMARY]: modifiers.active,
        });

        return (
            <MenuItem
                className={classes}
                key={item}
                onClick={handleClick}
                shouldDismissPopover={false}
                text={item}
            />
        );
    }

    private itemPredicate = (query: string, item: string) => item.includes(query.toUpperCase());

    private tagRenderer = (item: string) => item;

    private addCCCToFilter = (newCCC: string | undefined) => {
        if (newCCC !== undefined && this.props.filterCCCs.find((currentCCC) => currentCCC === newCCC) === undefined) {
            this.props.onUpdateFilterCCC([...this.props.filterCCCs, newCCC]);
        }
    }

    private removeCCCFromFilter = (item: string) => {
        this.props.onUpdateFilterCCC(
            this.props.filterCCCs.filter((currentCCC) => currentCCC !== item),
        );
    }
}

const FilterCCCConnected = connect(
    (state: IAllReducers): IFilterCCCStateProps => ({
        allCCCs: getUniqueCCCs(state),
        filterCCCs: state.filters.filterCCCs,
    }),
    (dispatch) => bindActionCreators({
        onUpdateFilterCCC: (filterCCC) => updateFilterCCC(filterCCC),
    }, dispatch),
)(FilterCCC);

export default FilterCCCConnected;
