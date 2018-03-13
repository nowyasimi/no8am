import * as React from "react";
import {bindActionCreators, Dispatch} from "redux";

import {Classes, MenuItem} from "@blueprintjs/core";
import {ISelectItemRendererProps, MultiSelect} from "@blueprintjs/labs";
import * as classNames from "classnames";

import {connect} from "../Connect";
import {getUniqueCCCs} from "../Helpers";
import {IAllReducers} from "../Interfaces";

import {returnOfUpdateFilterCCC, updateFilterCCC} from "./FilterActions";

interface IFilterCCCStateProps {
    filterCCCs: string[];
    allCCCs: string[];
}

interface IFilterCCCDispatchProps {
    onUpdateFilterCCC: (filterCCC: string[]) => typeof returnOfUpdateFilterCCC;
}

@connect<IFilterCCCStateProps, IFilterCCCDispatchProps, {}>(mapStateToProps, mapDispatchToProps)
export default class FilterCCC extends React.Component<IFilterCCCStateProps & IFilterCCCDispatchProps> {

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

    private itemRenderer = ({item, isActive, handleClick}: ISelectItemRendererProps<string>) => {
        const classes = classNames({
            [Classes.ACTIVE]: isActive,
            [Classes.INTENT_PRIMARY]: isActive,
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

function mapStateToProps(state: IAllReducers): IFilterCCCStateProps {
    return {
        allCCCs: getUniqueCCCs(state),
        filterCCCs: state.filters.filterCCCs,
    };
}

function mapDispatchToProps(dispatch: Dispatch<IAllReducers>) {
    return bindActionCreators({
        onUpdateFilterCCC: (filterCCC) => updateFilterCCC(filterCCC),
    }, dispatch);
}
