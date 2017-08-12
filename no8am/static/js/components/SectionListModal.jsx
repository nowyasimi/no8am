let React = require('react');

import {Modal} from "react-bootstrap"
import {connect} from 'react-redux'

import {closeSectionListModal} from '../actions/sectionActions'
import CourseTableSection from "./CourseTableSection.jsx"
import SectionDetails from './SectionDetails.jsx'


@connect(mapStateToProps, mapDispatchToProps)
export default class SectionListModal extends React.Component {

    constructor() {
        super();

        this.state = {
            showModal: false,
            clickedCourseButtonId: null,
        };

        this.handleClose = this.handleClose.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.clickedCourseButtonId !== undefined) {
            console.log(nextProps);
            this.setState({
                showModal: true,
                clickedCourseButtonId: nextProps.clickedCourseButtonId
            });
        }
    }

    handleClose() {
        this.setState({
            showModal:false
        });

        this.props.onSectionListModalClose();
    }

    render() {

        let course = this.props.courses.find(x => x.courseId == this.state.clickedCourseButtonId);

        let parentCourse = course != null ? this.props.courses.find(x => x.courseId == course.parentCourseId) : null;
        let parentSectionNum = parentCourse != null && parentCourse.selected != null ? parentCourse.sections[parentCourse.selected].sectionNum : null;

        let tableSections = null;

        if (course != null && parentSectionNum != null) {
            tableSections = course.sections.filter(section => section.dependent_main_sections.includes(parentSectionNum));
        } else if (course != null && parentSectionNum == null ) {
            tableSections = course.sections;
        }

        let reactTableSections = tableSections != null ?
            tableSections.map((section, sectionIndex) => <CourseTableSection {...section}
                key={`coursetablecourse${course.courseId}section${sectionIndex}`}
                courseId={course.courseId} sectionId={sectionIndex} />) : null;

        return (
            <Modal show={this.state.showModal} onHide={this.handleClose} dialogClassName="sectionListModal">
                <Modal.Dialog>
                    <Modal.Body>
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
                            { reactTableSections }
                            </tbody>
                        </table>
                        <div id="additionalInfo" style={{margin: '5px 5px 5px 5px'}}>
                            <button id="selectSection" className="btn btn-primary">
                                Done
                            </button>
                            <div id="sectionDetails">
                                <SectionDetails />
                            </div>
                        </div>
                    </Modal.Body>
                </Modal.Dialog>
            </Modal>
        );
    }
}

// Map Redux state to component props
function mapStateToProps(state) {
    return {
        clickedCourseButtonId: state.clickedCourseButtonId,
        courses: state.courses
    }
}

// Map Redux actions to component props
function mapDispatchToProps(dispatch) {
    return {
        onSectionListModalClose: () => dispatch(closeSectionListModal())
    }
}

