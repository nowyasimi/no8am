import * as React from "react";
import {connect} from "react-redux";
import {createSelector} from "reselect";

import {KeyCombo, NonIdealState, Spinner} from "@blueprintjs/core";
import {IconNames} from "@blueprintjs/icons";

import {searchKeyCombo} from "../search/SearchBoxWithPopover";
import SectionList from "../sections/SectionList";
import SelectedSectionsSummary from "../sections/SelectedSectionsSummary";

import {DataLoadingState} from "../Constants";
import {getSelectedSearchItemMemoized} from "../Helpers";
import {IAllReducers, ISearchItem} from "../Interfaces";

// const buttonStyle: React.CSSProperties = {
//     marginLeft: "5px",
// };

type ILeftSideAllProps = ILeftSideProps & ILeftSideStateProps;

interface ILeftSideProps {
    style: React.CSSProperties;
}

interface ILeftSideStateProps {
    hasSearchItems: boolean;
    selectedSearchItem: ISearchItem | undefined;
    searchStatus: DataLoadingState;
    sectionStatus: DataLoadingState;
}

class LeftSide extends React.Component<ILeftSideAllProps>  {

    private instructions: JSX.Element = (
        <div> Click the search box to start or press
            <span style={{paddingLeft: "5px"}}><KeyCombo combo={searchKeyCombo} /></span>
        </div>
    );

    public componentDidMount() {
        window.onbeforeunload = (e) => {
            return this.props.hasSearchItems;
        };
    }

    public componentWillReceiveProps(nextProps: ILeftSideAllProps) {
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
            <div style={this.props.style}>
                {/* <Button rightIconName={"refresh"} text={"Check for course updates"} style={buttonStyle} /> */}
                {/* <Button iconName={"help"} style={buttonStyle} /> */}
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
                        description="Choose from the searches to view sections"
                    />
                    <div style={{paddingTop: "30px"}}>
                        <SelectedSectionsSummary />
                    </div>
                </div>
            );
        } else if (this.props.hasSearchItems && this.props.selectedSearchItem !== undefined) {
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

const LeftSideConnected = connect(
    (state: IAllReducers): ILeftSideStateProps => ({
        hasSearchItems: getHasSearchItems(state),
        searchStatus: state.search.status,
        sectionStatus: state.sections.status,
        selectedSearchItem: getSelectedSearchItemMemoized(state),
    }),
)(LeftSide);

export default LeftSideConnected;
