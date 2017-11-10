import * as React from "react";

import {connect} from "react-redux";

import {Button, Menu, MenuItem, NonIdealState, Popover, Position, Spinner} from "@blueprintjs/core";

import SearchOmnibox from "../search/SearchOmnibox";
import CourseCards from "./CourseCards";
import OpenDialog from "./OpenDialog";
import SaveDialog from "./SaveDialog";
import SectionList from "./SectionList";

import {DataLoadingState} from "../Constants";
import {clickAdvancedSectionSelection} from "../filters/FiltersActions";
import {openSearchOmnibox} from "../search/SearchActions";

interface ILeftSideProps {
    currentSearch?: any;
    onOpenSearchOmnibox?: () => Promise<void>;
}

@(connect(mapStateToProps, mapDispatchToProps) as any)
export default class LeftSide extends React.Component<ILeftSideProps, undefined>  {

    public render() {
        let mainContent = null;

        switch (this.props.currentSearch.state) {
            case DataLoadingState.NO_SELECTION:
                mainContent = (
                    <NonIdealState
                        className="nonIdealState"
                        title="Welcome to No8am!"
                        description={(
                            <div>Use the search button to start or press
                                <span className="pt-key-combo searchOmniboxKeyCombo">
                                    <kbd className="pt-key pt-modifier-key">
                                        <span className="pt-icon-standard pt-icon-key-command" />
                                        cmd
                                    </kbd>
                                    <kbd className="pt-key">K</kbd>
                                </span>
                            </div>)}
                    />
                );
                break;
            case DataLoadingState.LOADING:
                mainContent = (
                    <NonIdealState
                        visual={<Spinner />}
                        className="nonIdealState"
                        description={`Loading data for ${this.props.currentSearch.item.userFriendlyFormat}`}
                    />
                );
                break;
            case DataLoadingState.LOADED:
                mainContent = <SectionList {...this.props.currentSearch} />;
                break;
        }

        const isNoCurrentSearch = this.props.currentSearch.state === DataLoadingState.NO_SELECTION;

        return (
            <div className="col-sm-6" id="filters">
                <SearchOmnibox/>

                <div className="pt-button-group pt-fill pt-large">
                    <OpenDialog />
                    <SaveDialog />
                    <Button iconName="search" text="Search" onClick={this.props.onOpenSearchOmnibox} />
                </div>

                <CourseCards />

                {mainContent}
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        currentSearch: state.currentSearch,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        onClickAdvancedSectionSelection: () => dispatch(clickAdvancedSectionSelection()),
        onOpenSearchOmnibox: () => dispatch(openSearchOmnibox()),
    };
}
