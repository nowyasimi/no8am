import * as React from "react";
import {connect} from "react-redux";
import {bindActionCreators, Dispatch} from "redux";

import {mouseEnterCalendarSection, mouseLeaveCalendarSection} from "../calendar/CalendarActions.js";
import {CalendarSectionColorType, colorMapping, Colors} from "../Constants";
import {IAllReducers, SectionWithColor} from "../Interfaces";
import {goToManagedCard} from "../sections/SectionActions";

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
    onGoToManagedCard?: () => void;
    onMouseEnterCalendarSection?: () => void;
    onMouseLeaveCalendarSection?: () => void;
}

class CalendarSection
    extends React.Component<ICalendarSectionStateProps & ICalendarSectionDispatchProps & ICalendarSectionProps> {

    public render() {

        const isCalendarHover = this.props.calendarHoverCRN === this.props.section.CRN;
        const hexColor = this.chooseHexColor(this.props.section.color, this.props.isSelected,
                                             isCalendarHover, this.props.isSectionListHover);
        const currentMeetingTime = this.props.section.meetingTimes[this.props.meetingTimeIndex];

        const style = {
            background: hexColor,
            display:  "block",
            height: `${currentMeetingTime.duration * 100 / 28}%`,
            top: currentMeetingTime.startTime * 100 / 28 + "%",
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

const CalendarSectionConnected = connect(
    (state: IAllReducers): ICalendarSectionStateProps => ({
        calendarHoverCRN: state.calendar.hoverCRN,
    }),
    (dispatch: Dispatch<IAllReducers>, sectionProps: ICalendarSectionProps) => bindActionCreators({
        onGoToManagedCard: () => goToManagedCard(sectionProps.section.departmentAndBareCourse),
        onMouseEnterCalendarSection: () => mouseEnterCalendarSection(sectionProps.section.CRN),
        onMouseLeaveCalendarSection: mouseLeaveCalendarSection,
    }, dispatch),
)(CalendarSection);

export default CalendarSectionConnected;
