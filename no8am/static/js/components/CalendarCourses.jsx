let React = require('react');

import {CalendarSection} from "./CalendarSection.jsx";

const DAYS_OF_WEEK_SHORT = ["M", "T", "W", "R", "F"];

export class CalendarCourses extends React.Component {

    constructor() {
        super();

        this.state = {};
    }

    static generateStateKey(courseId, sectionIndex, courseGroupId) {
        return `courseGroupId${courseGroupId}course${courseId}section${sectionIndex}`;
    }

    handleMouseEnter(courseId, sectionIndex, courseGroupId) {
        this.setState({
            [CalendarCourses.generateStateKey(courseId, sectionIndex, courseGroupId)]: true
        });
    }

    handleMouseLeave(courseId, sectionIndex, courseGroupId) {
        this.setState({
            [CalendarCourses.generateStateKey(courseId, sectionIndex, courseGroupId)]: false
        });
    }

    // Always draw selected sections
    // Draw potential sections for currently selected course or course group
    // No selected sections to worry about for course groups

    createSections(sectionsToDisplay, courses, courseGroupId) {

        // loop through all courses
        for (let courseId in courses) {
            let course = courses[courseId];

            // loop through sections
            for (let sectionIndex in course.sections) {
                let section = course.sections[sectionIndex];

                let eventKey = CalendarCourses.generateStateKey(courseId, sectionIndex, courseGroupId);

                let mouseEnterHandler = this.handleMouseEnter.bind(this, courseId, sectionIndex, courseGroupId);
                let mouseLeaveHandler = this.handleMouseLeave.bind(this, courseId, sectionIndex, courseGroupId);

                // create calendar section elements and group them by day
                for (let index in section.daysMet) {
                    let day = section.daysMet[index][0];
                    let key = `courseGroupId${courseGroupId}course${courseId}section${sectionIndex}index${index}`;

                    sectionsToDisplay[day].push(
                        <CalendarSection key={key} {...this.props} {...course} {...section} day={index}
                                         courseGroupId={courseGroupId} courseId={courseId} sectionId={sectionIndex}
                                         isHover={this.state[eventKey]}
                                         mouseEnterHandler={mouseEnterHandler}
                                         mouseLeaveHandler={mouseLeaveHandler}/>
                    )
                }
            }
        }
    }

    generateCourseData() {

        let sectionsToDisplay = {
            "M": [], "T": [], "W": [], "R": [], "F": []
        };

        let courses = this.props.schedule.course;
        this.createSections(sectionsToDisplay, courses);
        for (let courseGroupId in this.props.schedule.courseGroups) {
            let courses = this.props.schedule.courseGroups[courseGroupId].courses;
            this.createSections(sectionsToDisplay, courses, courseGroupId);
        }

        return DAYS_OF_WEEK_SHORT.map((day) =>
            (
                <div className="day" id={day} key={day}>
                    <ul className="list-unstyled open">
                        {sectionsToDisplay[day]}
                    </ul>
                </div>
            )
        );

    }

    render() {
        return (
            <div id="course-data" className="list-group-item">
                <div className="week">
                    { this.generateCourseData() }
                </div>
            </div>

        );
    }
}
