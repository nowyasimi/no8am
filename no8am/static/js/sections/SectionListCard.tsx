import * as React from "react";
import {bindActionCreators, Dispatch} from "redux";

import {connect} from "../Connect";

import {Icon} from "@blueprintjs/core";
import {Tooltip2} from "@blueprintjs/labs";
import * as classNames from "classnames";
import {Transition} from "react-transition-group";

import {isMainSection} from "../Helpers";
import {IAllReducers, ISectionMain, Section} from "../Interfaces";
import {clickSectionListCard, mouseEnterSectionListCard, mouseLeaveSectionListCard, returnOfClickSectionListCard,
        returnOfMouseEnterSectionListCard, returnOfMouseLeaveSectionListCard} from "./SectionActions";

const duration: number = 300;

const defaultStyle = {
    maxHeight: 0,
    opacity: 0,
    transition: `max-height ${duration}ms ease-in-out, opacity ${duration}ms ease-in-out`,
};

const transitionStyles: any = {
    entered:  { maxHeight: "100px", opacity: 1 },
    entering: { maxHeight: "100px", opacity: 1 },
};

const unavailableExtraSectionMessage = "This section can be selected with one of the following main sections:";
const unavailableMainSectionMessage = "This section cannot be selected due to other selections for this course";

interface ISectionListCard {
    isLastOfType: boolean;
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
    onClickSectionListCard?: () => typeof returnOfClickSectionListCard;
    onMouseEnterSectionListCard?: () => typeof returnOfMouseEnterSectionListCard;
    onMouseLeaveSectionListCard?: () => typeof returnOfMouseLeaveSectionListCard;
}

@connect<ISectionListCardStateProps, ISectionListCardDispatchProps, ISectionListCard>
    (mapStateToProps, mapDispatchToProps)
export default class SectionListCard
    extends React.Component<ISectionListCard & ISectionListCardDispatchProps & ISectionListCardStateProps> {

    public render() {

        const unavailableMessage = this.props.section.main ? unavailableMainSectionMessage :
            `${unavailableExtraSectionMessage} ${this.props.section.dependent_main_sections}`;

        const sectionListCardWithTransition = (
            <Transition
                in={this.props.isVisible}
                timeout={duration}
                mountOnEnter={true}
                unmountOnExit={true}
            >
                {(transitionState: any) => this.createSectionListCard(transitionState)}
            </Transition>
        );

        const isTooltipOpen = this.props.isAdvanced && this.props.sectionListHoverCrn !== null &&
            this.props.sectionListHoverCrn === this.props.section.CRN && this.props.isUnavailable;

        return this.props.isAdvanced ? (
            <Tooltip2
                className={this.props.isVisible ? "sectionListCardTooltip" : ""}
                content={<span>{unavailableMessage}</span>}
                isOpen={isTooltipOpen}
                openOnTargetFocus={false}
                placement="right"
            >
                {sectionListCardWithTransition}
            </Tooltip2>) : sectionListCardWithTransition;
    }

    private createSectionListCard(transitionState: any) {
        // identify if section is selected and violates selection rules based on other selections

        const isViolation = this.props.isSelected && this.props.isUnavailable && !this.props.isManaged;

        const classes = classNames({
            managedSection: this.props.isManaged,
            selectedSection: this.props.isSelected,
            unavailableSection: this.props.isUnavailable,
            violationSection: isViolation,
        });

        return (
            <div>
                <div
                    className={`pt-card pt-interactive sectionCard ${this.props.isLastOfType ? "lastOfType" : ""}`}
                    onMouseEnter={this.props.onMouseEnterSectionListCard}
                    onMouseLeave={this.props.onMouseLeaveSectionListCard}
                    style={{...defaultStyle, ...transitionStyles[transitionState]}}
                >
                    <ul
                        className={`sectionCardItemContainer ${classes}`}
                        onClick={this.props.onClickSectionListCard}
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
            </div>
        );
    }
}

function mapStateToProps(state: IAllReducers): ISectionListCardStateProps {
    return {
        isAdvanced: state.filters.isAdvanced,
        sectionListHoverCrn: state.calendar.hoverCRN,
    };
}

function mapDispatchToProps(dispatch: Dispatch<IAllReducers>, props: ISectionListCard): ISectionListCardDispatchProps {
    return bindActionCreators({
        onClickSectionListCard: () => clickSectionListCard(props.section),
        onMouseEnterSectionListCard: () => mouseEnterSectionListCard(props.section),
        onMouseLeaveSectionListCard: mouseLeaveSectionListCard,
    }, dispatch);
}
