import * as React from "react";
import {bindActionCreators, Dispatch} from "redux";

import {Button, Checkbox, Classes, Dialog, Intent} from "@blueprintjs/core";
import {Tooltip2} from "@blueprintjs/labs";
import * as classNames from "classnames";
import {Position} from "popper.js";

import {connect} from "../Connect";
import {IAllReducers, ISearchItem} from "../Interfaces";
import {clickDoneSelecting, removeSearch, returnOfClickDoneSelecting, returnOfRemoveSearch,
        returnOfRevertToOriginAbbreviation, returnOfSearchAgainForAbbreviation, revertToOriginAbbreviation,
        searchAgainForAbbreviation} from "../sections/SectionActions";
import FilterTime from "./FilterTime";

interface ILookupFiltersProps {
    filterTime: any;
    searchItem: ISearchItem;
    numberOfSectionsVisible: number;
    numberOfSectionsTotal: number;
}

interface ILookupFiltersDispatchProps {
    onClickDoneSelecting: () => typeof returnOfClickDoneSelecting;
    onRevertToOriginAbbreviation: () => typeof returnOfRevertToOriginAbbreviation;
    onSearchAgainForAbbreviation: () => typeof returnOfSearchAgainForAbbreviation;
    onRemoveSearch: () => typeof returnOfRemoveSearch;
}

interface ILookupFiltersState {
    isConfirmRevertDialogOpen: boolean;
    doNotAskToConfirmRevertAgain: boolean;
}

@connect<{}, ILookupFiltersDispatchProps, ILookupFiltersProps>((state: IAllReducers) => ({}), mapDispatchToProps)
export default class LookupFilters
    extends React.Component<ILookupFiltersDispatchProps & ILookupFiltersProps, ILookupFiltersState> {

    private shouldConfirmRevertLocalStorageKey = "shouldConfirmRevert";

    private checkboxStyle = {
        paddingTop: "10px",
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
                {this.renderButtons()}
                {this.renderConfirmRevertDialog()}
            </div>
        );
    }

    private renderConfirmRevertDialog() {
        return (
            <Dialog
                iconName="warning-sign"
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
        return (
            <div>
                {this.renderOriginAbbreviationButtons(Intent.NONE)}
                <Button
                    text={`Done selecting`}
                    onClick={this.props.onClickDoneSelecting}
                />
                <Button
                    text={`Remove search`}
                    onClick={this.props.onRemoveSearch}
                />
            </div>
        );
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
            const tooltipPlacement: Position = "bottom";

            return [(
                <Tooltip2
                    content={`Remove selected sections for ${courseAbbreviation} and go to ${abbreviation}`}
                    hoverOpenDelay={tooltipDelay}
                    placement={tooltipPlacement}
                    disabled={disableButtonsAndPopovers}
                >
                    <Button
                        className={classes}
                        text={`Revert to ${this.props.searchItem.originItemAbbreviation}`}
                        onClick={this.onRevertToOriginAbbreviationWithDialogHandler}
                        intent={revertButtonIntent}
                    />
                </Tooltip2>
                ), (
                <Tooltip2
                    content={`Keep search for ${courseAbbreviation} and create a new search for ${abbreviation}`}
                    hoverOpenDelay={tooltipDelay}
                    placement={tooltipPlacement}
                    disabled={disableButtonsAndPopovers}
                >
                    <Button
                        className={classes}
                        text={`Search again for ${this.props.searchItem.originItemAbbreviation}`}
                        onClick={this.onSearchAgainForAbbreviationWithDialogHandler}
                    />
                </Tooltip2>
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

function mapDispatchToProps(dispatch: Dispatch<IAllReducers>): ILookupFiltersDispatchProps {
    return bindActionCreators({
        onClickDoneSelecting: clickDoneSelecting,
        onRemoveSearch: removeSearch,
        onRevertToOriginAbbreviation: revertToOriginAbbreviation,
        onSearchAgainForAbbreviation: searchAgainForAbbreviation,
    }, dispatch);
}
