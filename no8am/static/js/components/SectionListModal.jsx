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
            clickedCourseButtonExtraSectionType: null
        };

        this.handleClose = this.handleClose.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.clickedCourseButtonId !== undefined) {
            console.log(nextProps);
            this.setState({
                showModal: true,
                clickedCourseButtonId: nextProps.clickedCourseButtonId,
                clickedCourseButtonExtraSectionType: nextProps.clickedCourseButtonExtraSectionType
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

        let courseId = this.state.clickedCourseButtonId;
        let extraSectionType = this.state.clickedCourseButtonExtraSectionType;
        let mainCourse = this.props.courses.find((x) => x.courseId == courseId);

        if (mainCourse === undefined) {
            return null;
        }

        console.log(mainCourse);

        let sections = extraSectionType == null ?
            mainCourse.sections : mainCourse.sections[mainCourse.selected].extra_section_lists[extraSectionType];

        let courseTableSections = sections.map((section, sectionIndex) =>
                <CourseTableSection key={`coursetablecourse${courseId}section${sectionIndex}`}
                                             {...section} courseId={courseId} sectionId={sectionIndex} />
            );

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
                            { courseTableSections }
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
        clickedCourseButtonExtraSectionType: state.clickedCourseButtonExtraSectionType,
        courses: state.courses
    }
}

// Map Redux actions to component props
function mapDispatchToProps(dispatch) {
    return {
        onSectionListModalClose: () => dispatch(closeSectionListModal())
    }
}

