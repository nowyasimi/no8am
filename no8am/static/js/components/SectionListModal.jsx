let React = require('react');

import {Modal} from "react-bootstrap"
import {ConnectedCourseTableSection, ConnectedSectionDetails} from "./Main.jsx"

export class SectionListModal extends React.Component {

    constructor() {
        super();

        this.state = {
            showModal: false,
            clickedCourseButtonId: undefined
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

        console.log('modal');

        let courseId = this.state.clickedCourseButtonId;
        let course = this.props.courses.find((x) => x.courseId == courseId);

        let courseTableSections = course === undefined ? [] : course.sections.map((section, sectionIndex) =>
                <ConnectedCourseTableSection key={`coursetablecourse${courseId}section${sectionIndex}`}
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
                                <ConnectedSectionDetails />
                            </div>
                        </div>
                    </Modal.Body>
                </Modal.Dialog>
            </Modal>
        );
    }
}
