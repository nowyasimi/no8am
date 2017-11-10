import * as React from "react";

import {Switch} from "@blueprintjs/core";
import {connect} from "react-redux";
import TimeAgo from "react-timeago";
import buildFormatter from "react-timeago/lib/formatters/buildFormatter";
import englishStrings from "react-timeago/lib/language-strings/en";

import {clickAdvancedSectionSelection} from "./FilterActions";

interface IGlobalFiltersProps {
    isAdvanced?: boolean;
    onClickAdvancedSectionSelection?: () => Promise<void>;
}

@(connect(mapStateToProps, mapDispatchToProps) as any)
export default class GlobalFilters extends React.Component<IGlobalFiltersProps, undefined> {

    public render() {
        const formatter = buildFormatter(englishStrings);

        const cacheTime = new Date();

        return (
            <div className="filters">
                <TimeAgo date={cacheTime} formatter={formatter} />
                <Switch style={{fontWeight: "normal"}} checked={!this.props.isAdvanced} label="Hide restricted sections" onChange={this.props.onClickAdvancedSectionSelection} />
            </div>
        );
    }
}

// Map Redux state to component props
function mapStateToProps(state) {
    return {
        isAdvanced: state.isAdvanced,
    };
}

// Map Redux actions to component props
function mapDispatchToProps(dispatch) {
    return {
        onClickAdvancedSectionSelection: () => dispatch(clickAdvancedSectionSelection()),
    };
}
