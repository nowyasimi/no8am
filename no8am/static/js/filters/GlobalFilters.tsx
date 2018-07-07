import * as React from "react";
import {connect} from "react-redux";
import {bindActionCreators, Dispatch} from "redux";

import {IAllReducers} from "../Interfaces";

import {Switch} from "@blueprintjs/core";
import TimeAgo from "react-timeago";
import buildFormatter from "react-timeago/lib/formatters/buildFormatter";
import englishStrings from "react-timeago/lib/language-strings/en";

import {clickAdvancedSectionSelection} from "./FilterActions";

interface IGlobalFiltersStateProps {
    isAdvanced?: boolean;
}

interface IGlobalFiltersDispatchProps {
    onClickAdvancedSectionSelection?: () => void;
}

class GlobalFilters extends React.Component<IGlobalFiltersStateProps & IGlobalFiltersDispatchProps> {

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

const GlobalFiltersConnected = connect(
    (state: IAllReducers): IGlobalFiltersStateProps => ({
        isAdvanced: state.filters.isAdvanced,
    }),
    (dispatch: Dispatch<IAllReducers>): IGlobalFiltersDispatchProps => bindActionCreators({
        onClickAdvancedSectionSelection: clickAdvancedSectionSelection,
    }, dispatch),
)(GlobalFilters);

export default GlobalFiltersConnected;
