let React = require('react');
import {connect} from 'react-redux'

import {ConnectedCalendarSection} from './CalendarSection.jsx'
import {ConnectedSectionListModal} from './SectionListModal.jsx'
import {DAYS_OF_WEEK} from '../Constants'


export class CalendarCourses extends React.Component {

    // Always draw selected sections
    // Draw potential sections for currently selected course or course group
    // No selected sections to worry about for course groups

    generateCourseData() {

        let sectionsToDisplay = [];

        // loop through all courses
        for (let courseIndex in this.props.courses) {
            let course = this.props.courses[courseIndex];
            let courseId = course.courseId;

            // loop through sections
            for (let sectionIndex in course.sections) {
                let section = course.sections[sectionIndex];

                // create calendar section elements and group them by day
                for (let index in section.daysMet) {
                    let day = section.daysMet[index][0];
                    let key = `course${courseId}section${sectionIndex}dayindex${index}`;
                    sectionsToDisplay.push({ day: day, section:
                        <ConnectedCalendarSection
                            key={key} {...this.props} {...course} {...section} day={index}
                            courseId={courseId} sectionId={sectionIndex}/>
                    });
                }
            }
        }

        {/*sectionsToDisplay = [].concat(this.props.courses.map(course => <ConnectedCalendarSection {...course} />));*/}

        let calendarSections = DAYS_OF_WEEK.map(day => (
            <div className="day" id={day} key={day}>
                <ul className="list-unstyled open">
                    {
                        sectionsToDisplay
                            .filter(sectionWrapper => sectionWrapper.day == day)
                            .map(sectionWrapper => sectionWrapper.section)
                    }
                </ul>
            </div>
            )
        );

        return calendarSections;
    }

    render() {
        let calendarSections = this.generateCourseData();

        return (
            <div id="course-data" className="list-group-item">
                <div className="week">
                    { calendarSections }
                </div>
                <ConnectedSectionListModal {...this.props} />
            </div>
        );
    }
}

const flatten = list => list.reduce(
    (a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []
);


// Map Redux state to component props
function mapStateToProps(state) {
    return {
        courses: state.courses
    }
}

export const ConnectedCalendarCourses = connect(mapStateToProps)(CalendarCourses);