let React = require('react');

import {CalendarSection} from "./CalendarSection.jsx"
import {CourseTableSection} from "./CourseTableSection.jsx"
import { createStore } from 'redux'
import { Provider, connect } from 'react-redux'
import { Modal } from 'react-bootstrap';
import { sectionReducer } from "../reducers/sectionReducer"
import {mouseEnterCalendarSection, mouseLeaveCalendarSection, mouseEnterCourseTableSection,
        mouseLeaveCourseTableSection, highlightCourseTableSection} from "../actions/sectionActions"

const DAYS_OF_WEEK_SHORT = ["M", "T", "W", "R", "F"];

const store = createStore(sectionReducer);

// Map Redux state to component props
function mapStateToProps(state) {
    return {
        hoverCourseId: state.hoverCourseId,
        courseTableHoverCourseGroupId: state.courseTableHoverCourseGroupId,
        courseTableHoverCourseId: state.courseTableHoverCourseId,
        courseTableHoverSectionId: state.courseTableHoverSectionId,
        highlightCourseGroupId: state.highlightCourseGroupId,
        highlightCourseId: state.highlightCourseId,
        highlightSectionId: state.highlightSectionId
    }
}

// Map Redux actions to component props
function mapDispatchToProps(dispatch, sectionProps) {
    return {
        onMouseEnterCalendar: () => dispatch(mouseEnterCalendarSection(sectionProps.courseId)),
        onMouseLeaveCalendar: () => dispatch(mouseLeaveCalendarSection()),
        onMouseEnterCourseTable: () => dispatch(mouseEnterCourseTableSection(sectionProps.courseGroupId, sectionProps.courseId, sectionProps.sectionId)),
        onMouseLeaveCourseTable: () => dispatch(mouseLeaveCourseTableSection()),
        onHighlightCourseTable: () => dispatch(highlightCourseTableSection(sectionProps.courseGroupId, sectionProps.courseId, sectionProps.sectionId))
    }
}

// Connected Component
const ConnectedCalendarSection = connect(
    mapStateToProps,
    mapDispatchToProps
)(CalendarSection);

const ConnectedCourseTableSection = connect(
    mapStateToProps,
    mapDispatchToProps
)(CourseTableSection);

export class CalendarCourses extends React.Component {

    constructor() {
        super();

        this.state = {
            showModal: true
        }
    }

    // Always draw selected sections
    // Draw potential sections for currently selected course or course group
    // No selected sections to worry about for course groups

    createSections(sectionsToDisplay, courseTableSections, courses, courseGroupId) {

        console.log(courseGroupId);
        console.log(this.props.schedule.lastClickedCourseButton);

        // loop through all courses
        for (let courseId in courses) {
            let course = courses[courseId];

            let lastClicked = this.props.schedule.lastClickedCourseButton;
            let matchesLastClicked =
                (courseGroupId != undefined && courseGroupId == lastClicked.id && lastClicked.type == "dept") ||
                (courseGroupId == undefined &&      courseId == lastClicked.id && lastClicked.type == "course");
            console.log(matchesLastClicked);

            // loop through sections
            for (let sectionIndex in course.sections) {
                let section = course.sections[sectionIndex];

                // create calendar section elements and group them by day
                for (let index in section.daysMet) {
                    let day = section.daysMet[index][0];
                    let key = `courseGroupId${courseGroupId}course${courseId}section${sectionIndex}index${index}`;
                    sectionsToDisplay[day].push(
                        <ConnectedCalendarSection key={key} {...this.props} {...course} {...section} day={index}
                                         courseGroupId={courseGroupId} courseId={courseId} sectionId={sectionIndex}/>
                    )
                }

                if (matchesLastClicked) {
                    console.log('match');
                    let key = `coursetablecourseGroupId${courseGroupId}course${courseId}section${sectionIndex}`;
                    courseTableSections.push(
                        <ConnectedCourseTableSection key={key} {...section} courseGroupId={courseGroupId} courseId={courseId}
                                            sectionId={sectionIndex} />
                    )
                }
            }
        }
    }

    generateCourseData() {

        let sectionsToDisplay = {
            "M": [], "T": [], "W": [], "R": [], "F": []
        };

        let courseTableSections = [];

        let courses = this.props.schedule.course;
        this.createSections(sectionsToDisplay, courseTableSections, courses);
        for (let courseGroupId in this.props.schedule.courseGroups) {
            let courses = this.props.schedule.courseGroups[courseGroupId].courses;
            this.createSections(sectionsToDisplay, courseTableSections, courses, courseGroupId);
        }

        let calendarSections = DAYS_OF_WEEK_SHORT.map((day) => (
            <div className="day" id={day} key={day}>
                <ul className="list-unstyled open">
                    {sectionsToDisplay[day]}
                </ul>
            </div>
            )
        );


        return {
            "calendarSections": calendarSections,
            "courseTableSections": courseTableSections
        }
    }


    hideModal() {
        this.setState({
            showModal:false
        })
    }

    render() {
        let {calendarSections, courseTableSections} = this.generateCourseData();
        console.log(calendarSections);

        return (
            <Provider store={store}>
                <div id="course-data" className="list-group-item">
                    <div className="week">
                        { calendarSections }
                    </div>

                    <div className="modal fade" id="courseTable" role="dialog">
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-body">
                                    <table className="table table-hover table-condensed" id="listViewData">
                                        <thead>
                                        <tr>
                                            <td>Section</td>
                                            <td>Time</td>
                                            <td>Room</td>
                                            <td>Instructor</td>
                                            <td>Seats</td>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        { courseTableSections }
                                        </tbody>
                                    </table>
                                    <div id="additionalInfo" style={{margin: '5px 5px 5px 5px'}}>
                                        <button id="selectSection" className="btn btn-primary">
                                            Done
                                        </button>
                                        <div className="spinner" style={{display:'none'}}>
                                            <div className="rect1"></div>
                                            <div className="rect2"></div>
                                            <div className="rect3"></div>
                                            <div className="rect4"></div>
                                            <div className="rect5"></div>
                                        </div>
                                        <div id="sectionDetails">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Provider>
        );
    }
}

// <Modal show={this.state.showModal} id="courseTable" dialogClassName="courseTable" onHide={this.hideModal()}>
//     <Modal.Dialog>
//         <Modal.Body>
//             <table className="table table-hover table-condensed" id="listViewData">
//                 <thead>
//                 <tr>
//                     <td>Section</td>
//                     <td>Time</td>
//                     <td>Room</td>
//                     <td>Instructor</td>
//                     <td>Seats</td>
//                 </tr>
//                 </thead>
//                 <tbody>
//                 { courseTableSections }
//                 </tbody>
//             </table>
//             <div id="additionalInfo" style={{margin: '5px 5px 5px 5px'}}>
//                 <button id="selectSection" className="btn btn-primary">
//                     Done
//                 </button>
//                 <div className="spinner" style={{display:'none'}}>
//                     <div className="rect1"></div>
//                     <div className="rect2"></div>
//                     <div className="rect3"></div>
//                     <div className="rect4"></div>
//                     <div className="rect5"></div>
//                 </div>
//                 <div id="sectionDetails">
//                 </div>
//             </div>
//         </Modal.Body>
//     </Modal.Dialog>
// </Modal>
