import * as React from "react";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";

import {Button, ButtonGroup, Checkbox, Classes, Dialog, Intent, Position, Tooltip} from "@blueprintjs/core";
import * as classNames from "classnames";

import {ISearchItem} from "../Interfaces";
import {clickDoneSelecting, removeSearch, revertToOriginAbbreviation,
    searchAgainForAbbreviation} from "../sections/SectionActions";
import FilterTime from "./FilterTime";

interface ILookupFiltersProps {
    filterTime: any;
    searchItem: ISearchItem;
    numberOfSectionsVisible: number;
    numberOfSectionsTotal: number;
}

interface ILookupFiltersDispatchProps {
    onClickDoneSelecting: () => void;
    onRevertToOriginAbbreviation: () => void;
    onSearchAgainForAbbreviation: () => void;
    onRemoveSearch: () => void;
}

interface ILookupFiltersState {
    isConfirmRevertDialogOpen: boolean;
    doNotAskToConfirmRevertAgain: boolean;
}

class LookupFilters extends React.Component<ILookupFiltersDispatchProps & ILookupFiltersProps, ILookupFiltersState> {

    private shouldConfirmRevertLocalStorageKey = "shouldConfirmRevert";

    private checkboxStyle: React.CSSProperties = {
        paddingTop: "10px",
    };

    private buttonStyle: React.CSSProperties = {
        borderRadius: "inherit",
        marginRight: "-1px",
    };

    public constructor(props: ILookupFiltersDispatchProps & ILookupFiltersProps) {
        super(props);

        this.state = {
            doNotAskToConfirmRevertAgain: false,
            isConfirmRevertDialogOpen: false,
        };
    }

    public render() {
        const {originItemAbbreviation, currentItemCourseAbbreviation} = this.props.searchItem;

        const sectionFilterString = this.props.numberOfSectionsVisible === this.props.numberOfSectionsTotal ? "all" :
            `${this.props.numberOfSectionsVisible} out of ${this.props.numberOfSectionsTotal}`;

        const sectionFilterSentence = `Showing ${sectionFilterString} sections for ` +
            `${originItemAbbreviation === null ? currentItemCourseAbbreviation : originItemAbbreviation}`;

        return (
            <div className="filters">
                <div>
                    {sectionFilterSentence}
                </div>
                <FilterTime filterTime={this.props.filterTime} />
                {/* <FilterCCC /> */}
                <ButtonGroup>
                    {this.renderButtons()}
                </ButtonGroup>
                {this.renderConfirmRevertDialog()}
            </div>
        );
    }

    private renderConfirmRevertDialog() {
        return (
            <Dialog
                icon={"warning-sign"}
                isOpen={this.state && this.state.isConfirmRevertDialogOpen}
                onClose={this.closeConfirmRevertDialog}
                title={`Are you sure you want to revert to ${this.props.searchItem.originItemAbbreviation}?`}
            >
                <div className={Classes.DIALOG_BODY}>
                    {`This will remove ${this.props.searchItem.selectedCrns.length} selected selections. `}
                    Use the "Search again" button to keep your selected selections.
                    <div style={this.checkboxStyle}>
                        <Checkbox
                            checked={this.state.doNotAskToConfirmRevertAgain}
                            onChange={this.toggleConfirmRevertDialogOpen}
                            label={"Don't ask me again"}
                        />
                    </div>
                </div>
                <div className={Classes.DIALOG_FOOTER}>
                    <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                        {this.renderOriginAbbreviationButtons(Intent.PRIMARY)}
                    </div>
                </div>
            </Dialog>
        );
    }

    private closeConfirmRevertDialog = () => {
        this.closeDialogAndCheckForDoNotShowAgain();
    }

    private renderButtons() {
        return [
            this.renderOriginAbbreviationButtons(Intent.NONE), (
            <Button
                text={`Done selecting`}
                onClick={this.props.onClickDoneSelecting}
            />), (
            <Button
                text={`Remove search`}
                onClick={this.props.onRemoveSearch}
            />),
        ];
    }

    private renderOriginAbbreviationButtons(revertButtonIntent: Intent) {
        if (this.props.searchItem.originItemAbbreviation !== null) {
            const disableButtonsAndPopovers = this.props.searchItem.currentItemCourseAbbreviation === null;
            const classes = classNames({
                [Classes.DISABLED]: disableButtonsAndPopovers,
            });

            const courseAbbreviation = this.props.searchItem.currentItemCourseAbbreviation;
            const abbreviation = this.props.searchItem.originItemAbbreviation;
            const tooltipDelay = 1000;

            return [(
                <Tooltip
                    content={`Remove selected sections for ${courseAbbreviation} and go to ${abbreviation}`}
                    hoverOpenDelay={tooltipDelay}
                    position={Position.BOTTOM}
                    disabled={disableButtonsAndPopovers}
                >
                    <Button
                        className={classes}
                        text={`Revert to ${this.props.searchItem.originItemAbbreviation}`}
                        onClick={this.onRevertToOriginAbbreviationWithDialogHandler}
                        intent={revertButtonIntent}
                        style={this.buttonStyle}
                    />
                </Tooltip>
                ), (
                <Tooltip
                    content={`Keep search for ${courseAbbreviation} and create a new search for ${abbreviation}`}
                    hoverOpenDelay={tooltipDelay}
                    position={Position.BOTTOM}
                    disabled={disableButtonsAndPopovers}
                >
                    <Button
                        className={classes}
                        text={`Search again for ${this.props.searchItem.originItemAbbreviation}`}
                        onClick={this.onSearchAgainForAbbreviationWithDialogHandler}
                        style={this.buttonStyle}
                    />
                </Tooltip>
                ),
            ];
        }
    }

    /**
     * Have the user confirm in the dialog that they want to revert
     * or close the dialog if they have already confirmed the action.
     */
    private onRevertToOriginAbbreviationWithDialogHandler = () => {
        // only ask to confirm the revert if the user has not asked to hide the confirmation dialog
        const shouldConfirmRevert = localStorage.getItem(this.shouldConfirmRevertLocalStorageKey) === null;

        // only ask to confirm the revert if the user has selected selections that will be removed
        const hasSelectedSectionsToRemove = this.props.searchItem.selectedCrns.length > 0;

        if (!this.state.isConfirmRevertDialogOpen && shouldConfirmRevert && hasSelectedSectionsToRemove) {
            this.setState({
                ...this.state,
                isConfirmRevertDialogOpen: true,
            });
        } else {
            this.closeDialogAndCheckForDoNotShowAgain();
            this.props.onRevertToOriginAbbreviation();
        }
    }

    /**
     * Close the revert confirmation dialog in case it was open
     * this will happen if the user originally planned to revert,
     * but decided to search again when the dialog appeared
     */
    private onSearchAgainForAbbreviationWithDialogHandler = () => {
        this.closeDialogAndCheckForDoNotShowAgain();
        this.props.onSearchAgainForAbbreviation();
    }

    private toggleConfirmRevertDialogOpen = () => {
        this.setState({
            ...this.state,
            doNotAskToConfirmRevertAgain: !this.state.doNotAskToConfirmRevertAgain,
        });
    }

    private closeDialogAndCheckForDoNotShowAgain() {
        this.setState({
            ...this.state,
            isConfirmRevertDialogOpen: false,
        });

        if (this.state.doNotAskToConfirmRevertAgain) {
            localStorage.setItem(this.shouldConfirmRevertLocalStorageKey, "");
        }
    }
}

const LookupFiltersConnected = connect(
    () => ({}),
    (dispatch): ILookupFiltersDispatchProps => bindActionCreators({
        onClickDoneSelecting: clickDoneSelecting,
        onRemoveSearch: removeSearch,
        onRevertToOriginAbbreviation: revertToOriginAbbreviation,
        onSearchAgainForAbbreviation: searchAgainForAbbreviation,
    }, dispatch),
)(LookupFilters);

export default LookupFiltersConnected;
