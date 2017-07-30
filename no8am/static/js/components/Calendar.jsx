let React = require('react');
import {connect} from 'react-redux'

import {DAYS_OF_WEEK, DAYS_OF_WEEK_LONG} from '../Constants'
import CalendarSection from './CalendarSection.jsx'
import SectionListModal from './SectionListModal.jsx'

@connect(mapStateToProps)
export default class Calendar extends React.Component {

    static generate_calendar_titles() {
        return DAYS_OF_WEEK_LONG.map((day) =>
            <div className="dayweek" key={day}>
                {day.slice(0,3)}<span className="hidden-xs hidden-sm hidden-md">{day.slice(3)}</span>
            </div>
        );
    }

    getSectionsByDay() {
        let sectionsToDisplay = [];

        for (let courseIndex in this.props.courses) {
            let course = this.props.courses[courseIndex];
            let courseId = course.courseId;

            // loop through sections
            for (let sectionIndex in course.sections) {
                let section = course.sections[sectionIndex];

                // create calendar section elements and group them by day
                for (let index in section.daysMet) {
                    let day = section.daysMet[index][0];
                    let key = `course${courseId}section${sectionIndex}dayIndex${index}`;
                    sectionsToDisplay.push({ day: day, section:
                        <CalendarSection
                            key={key} {...this.props} {...course} {...section} day={index}
                            courseId={courseId} sectionId={sectionIndex} />
                    });
                }
            }
        }

        return sectionsToDisplay;
    }


    render() {
        let sectionsByDay = this.getSectionsByDay();

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
                            <SectionListModal {...this.props} />
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
        courses: state.courses
    }
}