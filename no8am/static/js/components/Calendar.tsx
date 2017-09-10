import * as React from 'react'
import {connect} from 'react-redux'

import {DAYS_OF_WEEK, DAYS_OF_WEEK_LONG} from '../Constants'
import CalendarSection from './CalendarSection'

@connect(mapStateToProps)
export default class Calendar extends React.Component {

    static generate_calendar_titles() {
        return DAYS_OF_WEEK_LONG.map((day) =>
            <div className="dayweek" key={day}>
                {day.slice(0,3)}<span className="hidden-xs hidden-sm hidden-md">{day.slice(3)}</span>
            </div>
        );
    }

    getCalendarSectionsByDay(section, isSelected = true) {

        let calendarSections = [];

        // create calendar section elements and group them by day
        for (let index in section.daysMet) {
            let day = section.daysMet[index][0];
            let key = `calendarSection${section.CRN}dayIndex${index}isSelected${isSelected}`;
            calendarSections.push({ day: day, section:
                <CalendarSection
                    key={key}
                    day={index}
                    {...section}
                    isSelected={isSelected}
                />
            });
        }

        return calendarSections;
    }


    render() {
        let sectionsByDay = [];

        for (let section of this.props.selectedSections) {
            sectionsByDay = sectionsByDay.concat(this.getCalendarSectionsByDay(section));
        }

        if (this.props.sectionListHoverSection) {
            sectionsByDay = sectionsByDay.concat(
                this.getCalendarSectionsByDay(this.props.sectionListHoverSection, false)
            );
        }


        return (
            <div className="col-sm-6 page2bg" id="calendar-col">
                <div>
                    <div id="calendar" className="list-group">
                        <div id="calendar-titles" className="panel-heading">
                            { Calendar.generate_calendar_titles() }
                        </div>
                        <div id="course-data" className="list-group-item">
                            <div className="week">
                                { DAYS_OF_WEEK.map(day =>
                                    <div className="day" id={day} key={day}>
                                        <ul className="list-unstyled open">
                                            { sectionsByDay
                                                .filter(sectionWrapper => sectionWrapper.day == day)
                                                .map(sectionWrapper => sectionWrapper.section)
                                            }
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}


// Map Redux state to component props
function mapStateToProps(state) {
    return {
        courses: state.courses,
        sectionListHoverSection: state.sectionListHoverSection,
        selectedSections: state.selectedSections
    }
}