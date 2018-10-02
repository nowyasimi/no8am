import * as React from "react";

import LastUpdateTracker from "../filters/LastUpdateTracker";
import CourseCards from "../search/CourseCards";
import {SearchBoxWithPopoverConnected as SearchBoxWithPopover} from "../search/SearchBoxWithPopover";

const searchBoxStyle: React.CSSProperties = {
    padding: "10px",
};

interface ISearchProps {
    style: React.CSSProperties;
}

export default class Search extends React.Component<ISearchProps> {
    public render() {
        return (
            <div className="searchContainer" style={{...this.props.style, position: "inherit"}}>
                <div style={this.props.style}>
                    <div style={searchBoxStyle}>
                        <SearchBoxWithPopover />
                    </div>
                    <CourseCards />
                    <LastUpdateTracker />
                </div>
            </div>
        );
    }
}
