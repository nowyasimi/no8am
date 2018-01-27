import * as React from "react";
import {bindActionCreators, Dispatch} from "redux";

import {mouseEnterCalendarSection, mouseLeaveCalendarSection, returnOfMouseEnterCalendarSection,
        returnOfMouseLeaveCalendarSection} from "../calendar/CalendarActions.js";
import {connect} from "../Connect";
import {colorDict} from "../Constants";
import {IAllReducers, Section} from "../Interfaces";
import {goToManagedCard, returnOfGoToManagedCard} from "../sections/SectionActions";

interface ICalendarSectionProps {
    isCurrentCourseCard: boolean;
    isSelected: boolean;
    section: Section;
    meetingTimeIndex: number;
}

interface ICalendarSectionStateProps {
    hoverCRN?: string | null;
}

interface ICalendarSectionDispatchProps {
    onGoToManagedCard?: () => typeof returnOfGoToManagedCard;
    onMouseEnterCalendarSection?: () => typeof returnOfMouseEnterCalendarSection;
    onMouseLeaveCalendarSection?: () => typeof returnOfMouseLeaveCalendarSection;
}

@connect<ICalendarSectionStateProps, ICalendarSectionDispatchProps, ICalendarSectionProps>
    (mapStateToProps, mapDispatchToProps)
export default class CalendarSection
    extends React.Component<ICalendarSectionStateProps & ICalendarSectionDispatchProps & ICalendarSectionProps> {

    public render() {

        const hexColor = colorDict.blue[this.props.isSelected ? "s" : "n"];

        const currentMeetingTime = this.props.section.meetingTimes[this.props.meetingTimeIndex];

        const style = {
            background: hexColor,
            display:  "block",
            height: (currentMeetingTime.startTime + currentMeetingTime.duration > 26 ?
                25.73 - currentMeetingTime.startTime : currentMeetingTime.duration) * 20 / 5.6 + "%",
            marginTop: currentMeetingTime.startTime * 20 / 5.6 + "%",
            zIndex: this.props.isSelected ? 1 : 5,
        };

        const className = this.props.isSelected ?  "selectedCalendarSection" : "unselectedCalendarSection";

        const innerDetails = this.props.hoverCRN === this.props.section.CRN ? (
            <p className="timesMet">
                {currentMeetingTime.startTimeUserFriendly + "-" + currentMeetingTime.endTimeUserFriendly}
            </p>) :
            <p className="courseNum">{this.props.section.departmentAndCourseAndSection.slice(0, -3)}</p>;

        return (
            <li
                style={style}
                className={className}
                onMouseEnter={this.props.onMouseEnterCalendarSection}
                onMouseLeave={this.props.onMouseLeaveCalendarSection}
                onClick={this.props.isCurrentCourseCard ? () => null : this.props.onGoToManagedCard}
            >
                {innerDetails}
            </li>
        );
    }
}

function mapStateToProps(state: IAllReducers): ICalendarSectionStateProps {
    return {
        hoverCRN: state.calendar.hoverCRN,
    };
}

function mapDispatchToProps(dispatch: Dispatch<IAllReducers>, sectionProps: ICalendarSectionProps) {
    return bindActionCreators({
        onGoToManagedCard: () => goToManagedCard(sectionProps.section.departmentAndBareCourse),
        onMouseEnterCalendarSection: () => mouseEnterCalendarSection(sectionProps.section.CRN),
        onMouseLeaveCalendarSection: mouseLeaveCalendarSection,
    }, dispatch);
}
