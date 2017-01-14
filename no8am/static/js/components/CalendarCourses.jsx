let React = require('react');

import { Modal } from 'react-bootstrap';

import { ConnectedCalendarSection, ConnectedSectionListModal } from './Main.jsx'



const DAYS_OF_WEEK_SHORT = ["M", "T", "W", "R", "F"];

export class CalendarCourses extends React.Component {

    // Always draw selected sections
    // Draw potential sections for currently selected course or course group
    // No selected sections to worry about for course groups

    generateCourseData() {

        let sectionsToDisplay = {
            "M": [], "T": [], "W": [], "R": [], "F": []
        };

        let courses = this.props.schedule.course;

        // loop through all courses
        for (let courseId in courses) {
            let course = courses[courseId];

            // loop through sections
            for (let sectionIndex in course.sections) {
                let section = course.sections[sectionIndex];

                // create calendar section elements and group them by day
                for (let index in section.daysMet) {
                    let day = section.daysMet[index][0];
                    let key = `course${courseId}section${sectionIndex}index${index}`;
                    sectionsToDisplay[day].push(
                        <ConnectedCalendarSection key={key} {...this.props} {...course} {...section} day={index}
                                                  courseId={courseId} sectionId={sectionIndex}/>
                    )
                }
            }
        }

        let calendarSections = DAYS_OF_WEEK_SHORT.map((day) => (
            <div className="day" id={day} key={day}>
                <ul className="list-unstyled open">
                    {sectionsToDisplay[day]}
                </ul>
            </div>
            )
        );


        return calendarSections;
    }

    render() {
        let calendarSections = this.generateCourseData();
        console.log(calendarSections);

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
