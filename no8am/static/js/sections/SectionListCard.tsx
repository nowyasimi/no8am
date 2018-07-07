import * as React from "react";
import {connect} from "react-redux";
import {bindActionCreators, Dispatch} from "redux";

import {Classes, Position, Tooltip} from "@blueprintjs/core";
import * as classNames from "classnames";
import {Transition} from "react-transition-group";

import {IAllReducers, Section} from "../Interfaces";
import {clickSectionListCard, mouseEnterSectionListCard, mouseLeaveSectionListCard} from "./SectionActions";

const duration: number = 500;

const baseTransition = `max-height ${duration}ms ease-in-out, opacity ${duration}ms ease-in-out`;

const defaultStyle = {
    maxHeight: 0,
    opacity: 0,
    transition: `${baseTransition}, width 0ms linear ${duration + 10}ms`,
    width: 0,
};

const transitionStyle: any = {
    maxHeight: "100px",
    opacity: 1,
    transition: baseTransition,
    width: "100%",
};

const unavailableExtraSectionMessage = "This section can be selected with one of the following main sections:";
const unavailableMainSectionMessage = "This section cannot be selected due to other selections for this course";

interface ISectionListCard {
    addMargin: boolean;
    isManaged: boolean;
    isSelected: boolean;
    isUnavailable: boolean;
    isVisible: boolean;
    section: Section;
}

interface ISectionListCardStateProps {
    isAdvanced?: boolean;
    sectionListHoverCrn?: string | null;
}

interface ISectionListCardDispatchProps {
    onClickSectionListCard?: () => void;
    onMouseEnterSectionListCard?: () => void;
    onMouseLeaveSectionListCard?: () => void;
}

class SectionListCard
    extends React.Component<ISectionListCard & ISectionListCardDispatchProps & ISectionListCardStateProps> {

    public render() {

        const unavailableMessage = this.props.section.main ? unavailableMainSectionMessage :
            `${unavailableExtraSectionMessage} ${this.props.section.dependent_main_sections}`;

        const sectionListCardWithTransition = (
            <Transition
                in={this.props.isVisible}
                timeout={duration}
                mountOnEnter={true}
                unmountOnExit={false}
            >
                {(transitionState: any) => this.createSectionListCard(transitionState)}
            </Transition>
        );

        const isTooltipOpen = this.props.isAdvanced && this.props.sectionListHoverCrn !== null &&
            this.props.sectionListHoverCrn === this.props.section.CRN && this.props.isUnavailable;

        return this.props.isAdvanced ? (
            <Tooltip
                className={`${this.props.isVisible ? "sectionListCardTooltip" : ""}`}
                content={<span>{unavailableMessage}</span>}
                isOpen={isTooltipOpen}
                openOnTargetFocus={false}
                position={Position.RIGHT}
            >
                {sectionListCardWithTransition}
            </Tooltip>) : sectionListCardWithTransition;
    }

    private createSectionListCard(transitionState: any) {
        // identify if section is selected and violates selection rules based on other selections

        const isViolation = this.props.isSelected && this.props.isUnavailable && !this.props.isManaged;

        const sectionCardClasses = classNames(
            Classes.CARD, Classes.INTERACTIVE, "sectionCard",
        );

        const sectionDetailsClasses = classNames("sectionCardItemContainer", {
            managedSection: this.props.isManaged,
            selectedSection: this.props.isSelected,
            unavailableSection: this.props.isUnavailable,
            violationSection: isViolation,
        });

        const transitionStyleUsingState = transitionState !== "entered" ? {} : transitionStyle;

        const marginStyle = {
            marginBottom: this.props.addMargin ? "20px" : 0,
        };

        return (
            <div
                className={sectionCardClasses}
                onMouseEnter={this.props.onMouseEnterSectionListCard}
                onMouseLeave={this.props.onMouseLeaveSectionListCard}
                style={{...defaultStyle, ...transitionStyleUsingState, ...marginStyle}}
            >
                <ul
                    className={sectionDetailsClasses}
                    onClick={this.props.isVisible ? this.props.onClickSectionListCard : () => null}
                >
                    <li className="sectionCardItem">
                        {this.props.section.departmentAndCourseAndSection}
                    </li>
                    <li className="sectionCardItem">
                        {this.props.section.timesMet.join(", ")}
                    </li>
                    <li className="sectionCardItem">
                        {this.props.section.roomMet.join(", ")}
                    </li>
                    <li className="sectionCardItem">
                        {this.props.section.professor.join(" ")}
                    </li>
                    <li className="sectionCardItem" style={{width: "10%"}}>
                        {this.props.section.freeSeats}
                    </li>
                </ul>
            </div>
        );
    }
}

const SectionListCardConnected = connect(
    (state: IAllReducers): ISectionListCardStateProps => ({
        isAdvanced: state.filters.isAdvanced,
        sectionListHoverCrn: state.calendar.hoverCRN,
    }),
    (dispatch: Dispatch<IAllReducers>, props: ISectionListCard): ISectionListCardDispatchProps => bindActionCreators({
        onClickSectionListCard: () => clickSectionListCard(props.section, props.isManaged),
        onMouseEnterSectionListCard: () => mouseEnterSectionListCard(props.section),
        onMouseLeaveSectionListCard: mouseLeaveSectionListCard,
    }, dispatch),
)(SectionListCard);

export default SectionListCardConnected;
