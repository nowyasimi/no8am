import * as React from "react";

import CourseButtons from "../search/CourseButtons";
import CourseCards from "../search/CourseCards";
import {SearchBoxWithPopoverConnected as SearchBoxWithPopover} from "../search/SearchBoxWithPopover";

interface ISearchProps {
    style: React.CSSProperties;
}

export default class Search extends React.Component<ISearchProps> {

    public render() {
        return (
            <div className="searchContainer" style={this.props.style}>
                <SearchBoxWithPopover />
                <CourseButtons />
                <CourseCards />
            </div>
        );
    }

}
