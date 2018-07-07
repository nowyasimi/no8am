import * as React from "react";
import {bindActionCreators, Dispatch} from "redux";
import {createSelector} from "reselect";

import {Button, KeyCombo, NonIdealState, Spinner} from "@blueprintjs/core";
import {IconNames} from "@blueprintjs/icons";

import CourseCards from "../search/CourseCards";
import {SearchBoxWithPopover, searchKeyCombo} from "../search/SearchBoxWithPopover";
import SectionList from "../sections/SectionList";
import SelectedSectionsSummary from "../sections/SelectedSectionsSummary";

import {connect} from "../Connect";
import {DataLoadingState} from "../Constants";
import {clickAdvancedSectionSelection, returnOfClickAdvancedSectionSelection} from "../filters/FilterActions";
import {getSelectedSearchItemMemoized} from "../Helpers";
import {IAllReducers, ISearchItem} from "../Interfaces";

const buttonStyle = {
    marginLeft: "5px",
};

type ILeftSideAllProps = ILeftSideProps & ILeftSideStateProps & ILeftSideDispatchProps;

interface ILeftSideProps {
    style: React.CSSProperties;
}

interface ILeftSideStateProps {
    hasSearchItems: boolean;
    selectedSearchItem: ISearchItem | undefined;
    searchStatus: DataLoadingState;
    sectionStatus: DataLoadingState;
}

interface ILeftSideDispatchProps {
    onClickAdvancedSectionSelection: () => typeof returnOfClickAdvancedSectionSelection;
}

@connect<ILeftSideStateProps, ILeftSideDispatchProps, ILeftSideProps>(mapStateToProps, mapDispatchToProps)
export default class LeftSide extends React.Component<ILeftSideAllProps>  {

    private instructions: JSX.Element = (
        <div> Click the search box above to start or press
            <span style={{paddingLeft: "5px"}}><KeyCombo combo={searchKeyCombo} /></span>
        </div>
    );

    public componentDidMount() {
        window.onbeforeunload = (e) => {
            return this.props.hasSearchItems;
        };
    }

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
            <div id="filters" style={this.props.style}>
                <SearchBoxWithPopover />
                {/* <Button rightIconName={"refresh"} text={"Check for course updates"} style={buttonStyle} /> */}
                {/* <Button iconName={"help"} style={buttonStyle} /> */}
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
                        visual={IconNames.SELECT}
                        className="nonIdealState"
                        description="Choose from the searches above to view sections"
                    />
                    <div style={{paddingTop: "30px"}}>
                        <SelectedSectionsSummary />
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
    }, dispatch);
}
