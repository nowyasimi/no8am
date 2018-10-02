import * as React from "react";
import {connect} from "react-redux";

import {DAYS_OF_WEEK, DAYS_OF_WEEK_LONG} from "../Constants";
import {getSelectedSearchItemWithSections, getSelectedSections} from "../Helpers";
import {IAllReducers, ISearchItemWithMatchingSections, SectionWithColor} from "../Interfaces";
import CalendarSection from "./CalendarSection";

import { isNullOrUndefined } from "util";

const calendarTitleContainerStyle: React.CSSProperties = {
    backgroundColor: "#f5f5f5",
    height: "30px",
    padding: 0,
};

const calendarColumnStyle: React.CSSProperties = {
    float: "left",
    width: "18.3%",
};

const dayOfWeekCalendarTitleStyle: React.CSSProperties = {
    ...calendarColumnStyle,
    fontSize: "18px",
    fontWeight: "bold",
    marginTop: "1%",
};

const calendarCourseDataStyle: React.CSSProperties = {
    height: "calc(100% - 30px)",
    padding: 0,
};

const hoursOfDayColumnStyle: React.CSSProperties = {
    float: "left",
    width: "8.5%",
};

interface ICalendarStateProps {
    sectionListHoverCrn: string | null;
    selectedSections: SectionWithColor[];
    selectedSearchItem: ISearchItemWithMatchingSections | undefined;
}

interface ICalendarProps {
    innerCalendarStyle: React.CSSProperties;
    style: React.CSSProperties;
}

interface ISectionToSeparateByDay {
    isSectionListHover: boolean;
    isSelected: boolean;
    section: SectionWithColor;
}

interface ICalendarSectionsByDay {
    [key: string]: JSX.Element[];
}

class Calendar extends React.Component<ICalendarStateProps & ICalendarProps> {

    public render() {
        const sectionListHoverSection = this.getSectionListHoverSection();
        let sectionsToSeparateByDay: ISectionToSeparateByDay[] = [];

        for (const section of this.props.selectedSections) {
            sectionsToSeparateByDay = [...sectionsToSeparateByDay, {
                isSectionListHover: section.CRN === this.props.sectionListHoverCrn,
                isSelected: true,
                section,
            }];
        }

        if (sectionListHoverSection) {
            sectionsToSeparateByDay = [...sectionsToSeparateByDay, {
                isSectionListHover: true,
                isSelected: false,
                section: sectionListHoverSection,
            }];
        }

        const sectionsSeparatedByDay = this.getCalendarSectionsByDay(sectionsToSeparateByDay);
        const calendarSectionsInCalendar = this.addCalendarSectionsToCalendar(sectionsSeparatedByDay);

        return (
            <div style={this.props.style}>
                <div className="list-group" style={this.props.innerCalendarStyle}>
                    <div style={calendarTitleContainerStyle} className="panel-heading">
                        <div style={{...hoursOfDayColumnStyle, color: "#f5f5f5"}}> - </div>
                        {this.generateCalendarTitles()}
                    </div>
                    <div style={calendarCourseDataStyle} className="list-group-item">
                        <div style={{...hoursOfDayColumnStyle, height: "100%", backgroundColor: "#f5f5f5", borderRightWidth: "0.5px", borderRightStyle: "groove", borderRightColor: "rgb(255, 255, 255)"}} className="day">
                            <ul>
                                {this.createHoursOfDay()}
                            </ul>
                        </div>
                        {calendarSectionsInCalendar}
                    </div>
                </div>
            </div>
        );
    }

    private createHoursOfDay(): JSX.Element[] {
        const hoursInDay = 14;
        const liStyle: React.CSSProperties = {
            display: "block",
            height: `${100 / hoursInDay}%`,
            width: "10%",
        };
        const pStyle: React.CSSProperties = {
            color: "black",
            fontSize: "12px",
            marginLeft: "0px",
            marginTop: "1px",
        };

        return [...Array(hoursInDay).keys()]
            .map((hourOfDay) => (
                <li className="selectedCalendarSection" style={{...liStyle, top: `${100 * hourOfDay / hoursInDay}%`}}>
                    <p className="courseNum" style={pStyle}>
                        {this.convertHourOfDayToTime(hourOfDay)}
                    </p>
                </li>
            ));
    }

    private convertHourOfDayToTime(hourOfDay: number) {
        const hourSinceStartOfDay = 8 + hourOfDay;

        if (hourSinceStartOfDay === 12) {
            return "12pm";
        } else if (hourSinceStartOfDay > 12) {
            return `${hourSinceStartOfDay - 12}pm`;
        } else {
            return `${hourSinceStartOfDay}am`;
        }
    }

    /**
     * Create the calendar header that displays each day of the week.
     */
    private generateCalendarTitles() {
        // iterate through DAYS_OF_WEEK so columns in the calendar are sorted by day of week
        return DAYS_OF_WEEK_LONG.map((day) => (
            <div style={dayOfWeekCalendarTitleStyle} key={day}>
                {day.slice(0, 3)}<span className="hidden-xs hidden-sm hidden-md">{day.slice(3)}</span>
            </div>
        ));
    }

    /**
     * Add an HTML wrapper for each day of the week that contains sections for a given day.
     * @param sectionsSeparatedByDay Sections grouped by day
     */
    private addCalendarSectionsToCalendar(sectionsSeparatedByDay: ICalendarSectionsByDay) {
        // iterate through DAYS_OF_WEEK so columns in the calendar are sorted by day of week
        return DAYS_OF_WEEK.map((day) => (
            <div style={calendarColumnStyle} className="day" id={day} key={`day${day}`}>
                <ul>
                    {sectionsSeparatedByDay[day]}
                </ul>
            </div>
        ));
    }

    /**
     * Create an entry in the calendar for each time a section meets in a week.
     * @param sectionToSeparate Section containing 0 or more meeting times
     */
    private createCalendarSectionsForSection(sectionToSeparate: ISectionToSeparateByDay) {
        return sectionToSeparate.section.meetingTimes
            // include day in object returned so CalendarSection elements can later be grouped by day
            .map((meetingTime, index) => ({
                calendarSection: (
                    <CalendarSection
                        key={`crn${sectionToSeparate.section.CRN}index${index}`}
                        isCurrentCourseCard={this.isCurrentCourseCard(sectionToSeparate.section)}
                        isSelected={sectionToSeparate.isSelected}
                        isSectionListHover={sectionToSeparate.isSectionListHover}
                        meetingTimeIndex={index}
                        section={sectionToSeparate.section}
                    />
                ),
                day: sectionToSeparate.section.meetingTimes[index].day,
            }));
    }

    private isCurrentCourseCard(section: SectionWithColor) {
        return this.props.selectedSearchItem !== undefined &&
               this.props.selectedSearchItem.currentItemCourseAbbreviation === section.departmentAndBareCourse;
    }

    /**
     * Creates a CalendarSection for each time a section meets in a week and groups it by day of the week.
     * @param sectionsToSeparate A list of sections to be displayed on the calendar
     */
    private getCalendarSectionsByDay(sectionsToSeparate: ISectionToSeparateByDay[]): ICalendarSectionsByDay {
        const startCalendarSectionsByDay: ICalendarSectionsByDay = {M: [], T: [], W: [], R: [], F: []};

        return sectionsToSeparate
            // convert each section to a list of that sections meetings times
            .map((sectionToSeparate) => this.createCalendarSectionsForSection(sectionToSeparate))
            // flatten to 1D array of CalendarSections
            .reduce((calendarSectionsToSeparate, nextCalendarSectionsToSeparate) =>
                calendarSectionsToSeparate.concat(nextCalendarSectionsToSeparate), [])
            // separate by day
            .reduce((calendarSectionsByDay, nextCalendarSection) => ({
                ...calendarSectionsByDay,
                [nextCalendarSection.day]: [...calendarSectionsByDay[nextCalendarSection.day],
                    nextCalendarSection.calendarSection],
            }), startCalendarSectionsByDay);
    }

    private getSectionListHoverSection() {
        if (isNullOrUndefined(this.props.sectionListHoverCrn) ||
          this.props.selectedSearchItem === undefined ||
          this.props.selectedSections.find((section) => section.CRN === this.props.sectionListHoverCrn) !== undefined) {
            return undefined;
        } else {
            return this.props.selectedSearchItem.sectionsMatchingOrigin
                    .find((currentSection) => currentSection.CRN === this.props.sectionListHoverCrn);
        }
    }
}

const getSectionListHoverCrn = (state: IAllReducers) => state.sections.sectionListHoverCrn;

const CalendarConnected = connect(
    (state: IAllReducers): ICalendarStateProps => ({
        sectionListHoverCrn: getSectionListHoverCrn(state),
        selectedSearchItem: getSelectedSearchItemWithSections(state),
        selectedSections: getSelectedSections(state),
    }),
)(Calendar);

export default CalendarConnected;
