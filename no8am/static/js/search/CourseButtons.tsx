import * as React from "react";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";

import {Button, ButtonGroup, Checkbox, Classes, Dialog, Intent, Position, Tooltip} from "@blueprintjs/core";
import * as classNames from "classnames";

import {getSelectedSearchItemMemoized} from "../Helpers";
import {IAllReducers, ISearchItem} from "../Interfaces";
import {clickDoneSelecting,
        removeSearch,
        revertToOriginAbbreviation,
        searchAgainForAbbreviation} from "../sections/SectionActions";

interface ICourseButtonsStateProps {
    searchItem: ISearchItem | undefined;
}

interface ICourseButtonsDispatchProps {
    onClickDoneSelecting: () => void;
    onRevertToOriginAbbreviation: () => void;
    onSearchAgainForAbbreviation: () => void;
    onRemoveSearch: () => void;
}

interface ICourseButtonsState {
    isConfirmRevertDialogOpen: boolean;
    doNotAskToConfirmRevertAgain: boolean;
}

class CourseButtons
    extends React.Component<ICourseButtonsDispatchProps & ICourseButtonsStateProps, ICourseButtonsState> {

    private shouldConfirmRevertLocalStorageKey = "shouldConfirmRevert";

    private buttonGroupStyle: React.CSSProperties = {
        padding: "10px 0px 10px 0px",
    };

    private checkboxStyle: React.CSSProperties = {
        paddingTop: "10px",
    };

    private buttonStyle: React.CSSProperties = {
        borderRadius: "inherit",
        marginRight: "-1px",
    };

    public constructor(props: ICourseButtonsDispatchProps & ICourseButtonsStateProps) {
        super(props);

        this.state = {
            doNotAskToConfirmRevertAgain: false,
            isConfirmRevertDialogOpen: false,
        };
    }

    public render() {
        return this.props.searchItem !== undefined ? (
            <div>
                <ButtonGroup style={this.buttonGroupStyle}>
                    {this.renderButtons(this.props.searchItem)}
                </ButtonGroup>
                {this.renderConfirmRevertDialog(this.props.searchItem)}
            </div>
        ) : null;
    }

    private renderConfirmRevertDialog(searchItem: ISearchItem) {
        return (
            <Dialog
                icon={"warning-sign"}
                isOpen={this.state && this.state.isConfirmRevertDialogOpen}
                onClose={this.closeConfirmRevertDialog}
                title={`Are you sure you want to revert to ${searchItem.originItemAbbreviation}?`}
            >
                <div className={Classes.DIALOG_BODY}>
                    {`This will remove ${searchItem.selectedCrns.length} selected selections. `}
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
                        {this.renderOriginAbbreviationButtons(true, searchItem)}
                    </div>
                </div>
            </Dialog>
        );
    }

    private closeConfirmRevertDialog = () => {
        this.closeDialogAndCheckForDoNotShowAgain();
    }

    private renderButtons(searchItem: ISearchItem) {
        return [
            this.renderOriginAbbreviationButtons(false, searchItem), (
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

    private renderOriginAbbreviationButtons(isForConfirmRevertDialog: boolean, searchItem: ISearchItem) {
        if (searchItem.originItemAbbreviation !== null) {
            const disableButtonsAndPopovers = searchItem.currentItemCourseAbbreviation === null;
            const highlightRevertButton = searchItem.selectedCrns.length === 0 && !disableButtonsAndPopovers;
            const classes = classNames({
                [Classes.DISABLED]: disableButtonsAndPopovers,
            });

            const courseAbbreviation = searchItem.currentItemCourseAbbreviation;
            const abbreviation = searchItem.originItemAbbreviation;
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
                        text={`Revert to ${searchItem.originItemAbbreviation}`}
                        onClick={this.onRevertToOriginAbbreviationWithDialogHandler}
                        intent={isForConfirmRevertDialog || highlightRevertButton ? Intent.PRIMARY : Intent.NONE}
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
                        text={`Search again for ${searchItem.originItemAbbreviation}`}
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
        const hasSelectedSectionsToRemove = this.props.searchItem !== undefined
            && this.props.searchItem.selectedCrns.length > 0;

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

export default connect(
    (state: IAllReducers): ICourseButtonsStateProps => ({
        searchItem: getSelectedSearchItemMemoized(state),
    }),
    (dispatch): ICourseButtonsDispatchProps => bindActionCreators({
        onClickDoneSelecting: clickDoneSelecting,
        onRemoveSearch: removeSearch,
        onRevertToOriginAbbreviation: revertToOriginAbbreviation,
        onSearchAgainForAbbreviation: searchAgainForAbbreviation,
    }, dispatch),
)(CourseButtons);
