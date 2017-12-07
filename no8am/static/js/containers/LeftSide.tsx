import * as React from "react";

import {connect} from "react-redux";
import {createSelector} from "reselect";

import {Button, Classes, IconClasses, KeyCombo, Menu, MenuItem, NonIdealState, Popover, Position,
    Spinner} from "@blueprintjs/core";

import OpenDialog from "../components/OpenDialog";
import SaveDialog from "../components/SaveDialog";
import CourseCards from "../search/CourseCards";
import {searchKeyCombo, SearchOmnibox} from "../search/SearchOmnibox";
import SectionList from "../sections/SectionList";

import {DataLoadingState} from "../Constants";
import {clickAdvancedSectionSelection} from "../filters/FilterActions";
import {IAllReducers, ISearchItem} from "../Interfaces";
import {openSearchOmnibox} from "../search/SearchActions";

type ILeftSideProps = ILeftSideStateProps & ILeftSideDispatchProps;

interface ILeftSideStateProps {
    hasSearchItems: boolean;
    searchStatus: DataLoadingState;
    sectionStatus: DataLoadingState;
}

interface ILeftSideDispatchProps {
    onClickAdvancedSectionSelection: () => Promise<void>;
    onOpenSearchOmnibox: () => Promise<void>;
}

@connect<ILeftSideStateProps, ILeftSideDispatchProps, ILeftSideProps>(mapStateToProps, mapDispatchToProps)
export default class LeftSide extends React.Component<ILeftSideProps>  {

    private instructions: JSX.Element = (
        <div>Use the search button to start or press
            <KeyCombo combo={searchKeyCombo} />
        </div>
    );

    public render() {
        const mainContent = this.getMainContent();

        return (
            <div className="col-sm-6" id="filters">
                <SearchOmnibox/>

                <div className={`${Classes.BUTTON_GROUP} ${Classes.FILL} ${Classes.LARGE}`}>
                    <OpenDialog />
                    <SaveDialog />
                    <Button iconName="search" text="Search" onClick={this.props.onOpenSearchOmnibox} />
                </div>

                <CourseCards />

                {mainContent}
            </div>
        );
    }

    private getMainContent() {
        if (this.props.searchStatus === DataLoadingState.FAILED ||
            this.props.sectionStatus === DataLoadingState.FAILED) {
            return (
                <div>
                    TODO
                </div>
            );
        } else if (this.props.searchStatus === DataLoadingState.LOADING ||
                   this.props.sectionStatus === DataLoadingState.LOADING) {
            return (
                <NonIdealState
                    visual={<Spinner />}
                    className="nonIdealState"
                    // TODO - make this a skeleton in search
                    description={`Loading course information`}
                />
            );
        } else if (this.props.hasSearchItems) {
            return <SectionList {...this.props.currentSearch} />;
        } else if (!this.props.hasSearchItems) {
            return (
                <NonIdealState
                    className="nonIdealState"
                    title="Welcome to No8am!"
                    description={this.instructions}
                />
            );
        } else {
            return (
                <div>
                    TODO
                </div>
            );
        }
    }

}

const getSearchItems = (state: IAllReducers): ISearchItem[] => state.sections.searchItems;

const getHasSearchItems = createSelector(
    [getSearchItems],
    (searchItems) => (searchItems.length > 0),
);

function mapStateToProps(state: IAllReducers): ILeftSideStateProps {
    return {
        hasSearchItems: getHasSearchItems(state),
        searchStatus: state.search.status,
        sectionStatus: state.sections.status,
    };
}

function mapDispatchToProps(dispatch): ILeftSideDispatchProps {
    return {
        onClickAdvancedSectionSelection: () => dispatch(clickAdvancedSectionSelection()),
        onOpenSearchOmnibox: () => dispatch(openSearchOmnibox()),
    };
}
