let React = require('react');

import {Modal} from "react-bootstrap"
import {ConnectedCourseTableSection, ConnectedSectionDetails} from "./Main.jsx"

export class SectionListModal extends React.Component {

    constructor() {
        super();

        this.state = {
            showModal: false
        };

        this.handleClose = this.handleClose.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.lastClickedViewSectionsButton !== undefined) {
            console.log(nextProps);
            this.setState({
                showModal: true,
                courseId: nextProps.lastClickedViewSectionsButton.id
            });
        }
    }

    handleClose() {
        this.setState({
            showModal:false
        });

        let courseId = this.props.highlight.courseId;
        let sectionId = this.props.highlight.sectionId;

        if (sectionId != undefined && sectionId != null) {
            sched.handleSelect(courseId, sectionId)
        }

        // if (isDept && row.length != 0) {
        //     let dept = $sectionTable.attr("data-dept-level");
        //     clickedCourse = row.attr("class").split(" ")[0].substring(6);
        //     sched.convertDeptToCourse(clickedCourse, clickedSection);
        //     sched.redrawData();
        // }


    }

    render() {
        let courseTableSections = [];

        let course = null;

        if (this.state.courseId !== undefined) {
            let courseId = this.state.courseId;
            course = this.props.schedule.course[courseId];
            let sections = course.sections;
            // loop through sections
            for (let sectionIndex in sections) {
                let section = sections[sectionIndex];
                let key = `coursetablecourse${courseId}section${sectionIndex}`;
                courseTableSections.push(
                    <ConnectedCourseTableSection key={key} {...section} courseId={courseId} sectionId={sectionIndex} />
                )
            }
        }

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
                                <ConnectedSectionDetails {...course}/>
                            </div>
                        </div>
                    </Modal.Body>
                </Modal.Dialog>
            </Modal>
        );
    }
}
