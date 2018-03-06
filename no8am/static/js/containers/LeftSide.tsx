import * as React from "react";
import {bindActionCreators, Dispatch} from "redux";
import {createSelector} from "reselect";

import {Button, Classes, IconClasses, KeyCombo, NonIdealState, Spinner} from "@blueprintjs/core";

import OpenDialog from "../components/OpenDialog";
import SaveDialog from "../components/SaveDialog";
import CourseCards from "../search/CourseCards";
import {searchKeyCombo, SearchOmnibox} from "../search/SearchOmnibox";
import SectionList from "../sections/SectionList";
import SelectedSectionsTable from "../sections/SelectedSectionsTable";

import {connect} from "../Connect";
import {DataLoadingState} from "../Constants";
import {clickAdvancedSectionSelection, returnOfClickAdvancedSectionSelection} from "../filters/FilterActions";
import {getSelectedSearchItemMemoized} from "../Helpers";
import {IAllReducers, ISearchItem} from "../Interfaces";
import {openSearchOmnibox, returnOfOpenSearchOmnibox} from "../search/SearchActions";

type ILeftSideProps = ILeftSideStateProps & ILeftSideDispatchProps;

interface ILeftSideStateProps {
    hasSearchItems: boolean;
    selectedSearchItem: ISearchItem | undefined;
    searchStatus: DataLoadingState;
    sectionStatus: DataLoadingState;
}

interface ILeftSideDispatchProps {
    onClickAdvancedSectionSelection: () => typeof returnOfClickAdvancedSectionSelection;
    onOpenSearchOmnibox: () => typeof returnOfOpenSearchOmnibox;
}

@connect<ILeftSideStateProps, ILeftSideDispatchProps, ILeftSideProps>(mapStateToProps, mapDispatchToProps)
export default class LeftSide extends React.Component<ILeftSideProps>  {

    private instructions: JSX.Element = (
        <div>Use the search button to start or press
            <span style={{paddingLeft: "5px"}}><KeyCombo combo={searchKeyCombo} /></span>
        </div>
    );

    public componentWillReceiveProps(nextProps: ILeftSideProps) {
        const currentSearchItem = this.props.selectedSearchItem;
        const nextSearchItem = nextProps.selectedSearchItem;

        if (currentSearchItem !== undefined && nextSearchItem !== undefined &&
            currentSearchItem.originItemAbbreviation !== nextSearchItem.originItemAbbreviation) {
                window.scrollTo(0, 0);
        }
    }

    public render() {
        const mainContent = this.getMainContent();

        return (
            <div className="col-sm-6" id="filters">
                <SearchOmnibox />

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
                    Failed to load course data. Refresh the page or try again later.
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
        } else if (this.props.hasSearchItems && this.props.selectedSearchItem === undefined) {
            return (
                <div>
                    <NonIdealState
                        visual={IconClasses.SELECT}
                        className="nonIdealState"
                        description="Choose from the searches above to view sections"
                    />
                    <div style={{paddingTop: "30px"}}>
                        <SelectedSectionsTable />
                    </div>
                </div>
            );
        } else if (this.props.hasSearchItems) {
            return <SectionList searchItem={this.props.selectedSearchItem} />;
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
        selectedSearchItem: getSelectedSearchItemMemoized(state),
    };
}

function mapDispatchToProps(dispatch: Dispatch<IAllReducers>): ILeftSideDispatchProps {
    return bindActionCreators({
        onClickAdvancedSectionSelection: clickAdvancedSectionSelection,
        onOpenSearchOmnibox: openSearchOmnibox,
    }, dispatch);
}
