import * as React from "react";
import {bindActionCreators, Dispatch} from "redux";

import {mouseEnterCalendarSection, mouseLeaveCalendarSection, returnOfMouseEnterCalendarSection,
        returnOfMouseLeaveCalendarSection} from "../calendar/CalendarActions.js";
import {connect} from "../Connect";
import {CalendarSectionColorType, colorMapping, Colors} from "../Constants";
import {IAllReducers, SectionWithColor} from "../Interfaces";
import {goToManagedCard, returnOfGoToManagedCard} from "../sections/SectionActions";

interface ICalendarSectionProps {
    isSectionListHover: boolean;
    isCurrentCourseCard: boolean;
    isSelected: boolean;
    section: SectionWithColor;
    meetingTimeIndex: number;
}

interface ICalendarSectionStateProps {
    calendarHoverCRN?: string | null;
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

        const isCalendarHover = this.props.calendarHoverCRN === this.props.section.CRN;
        const hexColor = this.chooseHexColor(this.props.section.color, this.props.isSelected,
                                             isCalendarHover, this.props.isSectionListHover);
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

        const innerDetails = isCalendarHover ? (
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

    private chooseHexColor(color: Colors, isSelected: boolean, isCalendarHover: boolean, isSectionListHover: boolean) {
        if (isSelected && (isCalendarHover || isSectionListHover)) {
            // cursor is on one of the calendar sections or selected section in section list
            return colorMapping[color][CalendarSectionColorType.HOVER];
        } else if (isSelected) {
            // section has been selected
            return colorMapping[color][CalendarSectionColorType.SELECTED];
        } else {
            // section has not been selected yet
            return colorMapping[color][CalendarSectionColorType.UNSELECTED];
        }
    }
}

function mapStateToProps(state: IAllReducers): ICalendarSectionStateProps {
    return {
        calendarHoverCRN: state.calendar.hoverCRN,
    };
}

function mapDispatchToProps(dispatch: Dispatch<IAllReducers>, sectionProps: ICalendarSectionProps) {
    return bindActionCreators({
        onGoToManagedCard: () => goToManagedCard(sectionProps.section.departmentAndBareCourse),
        onMouseEnterCalendarSection: () => mouseEnterCalendarSection(sectionProps.section.CRN),
        onMouseLeaveCalendarSection: mouseLeaveCalendarSection,
    }, dispatch);
}
