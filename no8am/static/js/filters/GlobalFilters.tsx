import * as React from "react";
import {bindActionCreators, Dispatch} from "redux";

import {connect} from "../Connect";
import {IAllReducers} from "../Interfaces";

import {Switch} from "@blueprintjs/core";
import TimeAgo from "react-timeago";
import buildFormatter from "react-timeago/lib/formatters/buildFormatter";
import englishStrings from "react-timeago/lib/language-strings/en";

import {clickAdvancedSectionSelection, returnOfClickAdvancedSectionSelection} from "./FilterActions";

interface IGlobalFiltersStateProps {
    isAdvanced?: boolean;
}

interface IGlobalFiltersDispatchProps {
    onClickAdvancedSectionSelection?: () => typeof returnOfClickAdvancedSectionSelection;
}

@connect<IGlobalFiltersStateProps, IGlobalFiltersDispatchProps, {}> (mapStateToProps, mapDispatchToProps)
export default class GlobalFilters extends React.Component<IGlobalFiltersStateProps & IGlobalFiltersDispatchProps> {

    public render() {
        const formatter = buildFormatter(englishStrings);

        const cacheTime = new Date();

        return (
            <div className="filters">
                <TimeAgo date={cacheTime} formatter={formatter} />
                <Switch
                    style={{fontWeight: "normal"}}
                    checked={!this.props.isAdvanced}
                    label="Hide restricted sections"
                    onChange={this.props.onClickAdvancedSectionSelection}
                />
            </div>
        );
    }
}

function mapStateToProps(state: IAllReducers): IGlobalFiltersStateProps {
    return {
        isAdvanced: state.filters.isAdvanced,
    };
}

function mapDispatchToProps(dispatch: Dispatch<IAllReducers>): IGlobalFiltersDispatchProps {
    return bindActionCreators({
        onClickAdvancedSectionSelection: clickAdvancedSectionSelection,
    }, dispatch);
}
