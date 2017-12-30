import * as React from "react";

import {connect} from "../Connect";

import {DAYS_OF_WEEK, DAYS_OF_WEEK_LONG} from "../Constants";
import {getSectionListHoverSection, getSelectedSections} from "../Helpers";
import {IAllReducers, Section} from "../Interfaces";
import CalendarSection from "./CalendarSection";

interface ICalendarStateProps {
    sectionListHoverSection: Section | undefined;
    selectedSections: Section[];
}

interface ISectionToSeparateByDay {
    isSelected: boolean;
    section: Section;
}

interface ICalendarSectionsByDay {
    [key: string]: JSX.Element[];
}

@connect<ICalendarStateProps, {}, {}>(mapStateToProps)
export default class Calendar extends React.Component<ICalendarStateProps> {

    /**
     * Create the calendar header that displays each day of the week.
     */
    private static generate_calendar_titles() {
        // iterate through DAYS_OF_WEEK so columns in the calendar are sorted by day of week
        return DAYS_OF_WEEK_LONG.map((day) => (
            <div className="dayweek" key={day}>
                {day.slice(0, 3)}<span className="hidden-xs hidden-sm hidden-md">{day.slice(3)}</span>
            </div>
        ));
    }

    /**
     * Add an HTML wrapper for each day of the week that contains sections for a given day.
     * @param sectionsSeparatedByDay Sections grouped by day
     */
    private static addCalendarSectionsToCalendar(sectionsSeparatedByDay: ICalendarSectionsByDay) {
        // iterate through DAYS_OF_WEEK so columns in the calendar are sorted by day of week
        return DAYS_OF_WEEK.map((day) => (
            <div className="day" id={day} key={day}>
                <ul className="list-unstyled open">
                    {sectionsSeparatedByDay[day]}
                </ul>
            </div>
        ));
    }

    /**
     * Create an entry in the calendar for each time a section meets in a week.
     * @param sectionToSeparate Section containing 0 or more meeting times
     */
    private static createCalendarSectionsForSection(sectionToSeparate: ISectionToSeparateByDay) {
        return sectionToSeparate.section.meetingTimes
            // include day in object returned so CalendarSection elements can later be grouped by day
            .map((meetingTime, index) => ({
                calendarSection: (
                    <CalendarSection
                        isSelected={sectionToSeparate.isSelected}
                        meetingTimeIndex={index}
                        section={sectionToSeparate.section}
                    />
                ),
                day: sectionToSeparate.section.meetingTimes[index].day,
            }));
    }

    /**
     * Creates a CalendarSection for each time a section meets in a week and groups it by day of the week.
     * @param sectionsToSeparate A list of sections to be displayed on the calendar
     */
    private static getCalendarSectionsByDay(sectionsToSeparate: ISectionToSeparateByDay[]): ICalendarSectionsByDay {
        const startCalendarSectionsByDay: ICalendarSectionsByDay = {M: [], T: [], W: [], R: [], F: []};

        return sectionsToSeparate
            // convert each section to a list of that sections meetings times
            .map((sectionToSeparate) => Calendar.createCalendarSectionsForSection(sectionToSeparate))
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

    public render() {
        let sectionsToSeparateByDay: ISectionToSeparateByDay[]  = [];

        for (const section of this.props.selectedSections) {
            sectionsToSeparateByDay = [...sectionsToSeparateByDay, {
                isSelected: true,
                section,
            }];
        }

        if (this.props.sectionListHoverSection) {
            sectionsToSeparateByDay = [...sectionsToSeparateByDay, {
                isSelected: false,
                section: this.props.sectionListHoverSection,
            }];
        }

        const sectionsSeparatedByDay = Calendar.getCalendarSectionsByDay(sectionsToSeparateByDay);
        const calendarSectionsInCalendar = Calendar.addCalendarSectionsToCalendar(sectionsSeparatedByDay);

        return (
            <div className="col-sm-6 page2bg" id="calendar-col">
                <div>
                    <div id="calendar" className="list-group">
                        <div id="calendar-titles" className="panel-heading">
                            {Calendar.generate_calendar_titles()}
                        </div>
                        <div id="course-data" className="list-group-item">
                            <div className="week">
                                {calendarSectionsInCalendar}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state: IAllReducers): ICalendarStateProps {
    // TODO - follow up on https://github.com/Microsoft/TypeScript/issues/7657
    // @ts-ignore
    return {
        sectionListHoverSection: getSectionListHoverSection(state),
        selectedSections: getSelectedSections(state),
    };
}
