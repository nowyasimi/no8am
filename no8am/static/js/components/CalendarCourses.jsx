let React = require('react');

import {CalendarSection} from "./CalendarSection.jsx";
import { createStore } from 'redux'
import { Provider, connect } from 'react-redux'

const DAYS_OF_WEEK_SHORT = ["M", "T", "W", "R", "F"];

const store = createStore(calendarSectionReducer);

export const mouseEnterSection = (courseId) => {
    return {
        type: 'MOUSE_ENTER',
        courseId
    }
};

export const mouseLeaveSection = (courseId) => {
    return {
        type: 'MOUSE_LEAVE',
        courseId
    };
};

// Map Redux state to component props
function mapStateToProps(state) {
    return {
        hover: state.hover,
        hoverCourseId: state.courseId
    }
}

// Map Redux actions to component props
function mapDispatchToProps(dispatch, sectionProps) {
    return {
        onMouseEnter: () => dispatch(mouseEnterSection(sectionProps.courseId)),
        onMouseLeave: () => dispatch(mouseLeaveSection(sectionProps.courseId))
    }
}

// Connected Component
const ConnectedCalendarSection = connect(
    mapStateToProps,
    mapDispatchToProps
)(CalendarSection);


export function calendarSectionReducer(state = {hover: false, hoverCourseId: null}, action) {
    switch (action.type) {
        case 'MOUSE_ENTER':
            return {
                hover: true,
                courseId: action.courseId
            };
        case 'MOUSE_LEAVE':
            return {
                hover: false,
                courseId: action.courseId
            };
        default:
            return state
    }
}


export class CalendarCourses extends React.Component {

    constructor() {
        super();
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

                // create calendar section elements and group them by day
                for (let index in section.daysMet) {
                    let day = section.daysMet[index][0];
                    let key = `courseGroupId${courseGroupId}course${courseId}section${sectionIndex}index${index}`;
                    sectionsToDisplay[day].push(
                        <Provider key={key} store={store}>
                            <ConnectedCalendarSection {...this.props} {...course} {...section} day={index}
                                             courseGroupId={courseGroupId} courseId={courseId} sectionId={sectionIndex}/>
                        </Provider>
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
