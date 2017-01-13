let React = require('react');

import {Modal} from "react-bootstrap"
import {ConnectedCourseTableSection} from "./Main.jsx"


export class SectionListModal extends React.Component {

    constructor() {
        super();

        this.state = {
            showModal: false
        };
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

    createSections() {

        let courseTableSections = [];

        if (this.state.courseId !== undefined) {
            let courseId = this.state.courseId;
            let sections = this.props.schedule.course[courseId].sections;
            // loop through sections
            for (let sectionIndex in sections) {
                let section = sections[sectionIndex];
                let key = `coursetablecourse${courseId}section${sectionIndex}`;
                courseTableSections.push(
                    <ConnectedCourseTableSection key={key} {...section} courseId={courseId} sectionId={sectionIndex} />
                )
            }
        }

        return courseTableSections;
    }

    render() {
        let handleClose = () => this.setState({showModal: false});

        return (
            <Modal show={this.state.showModal} onHide={handleClose} dialogClassName="sectionListModal">
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
                            { this.createSections() }
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
                    </Modal.Body>
                </Modal.Dialog>
            </Modal>
        );
    }
}

// <div className="modal fade" id="courseTable" role="dialog">
//     <div className="modal-dialog">
//         <div className="modal-content">
//             <div className="modal-body">
//                 <table className="table table-hover table-condensed" id="listViewData">
//                     <thead>
//                     <tr>
//                         <td>Section</td>
//                         <td>Time</td>
//                         <td>Room</td>
//                         <td>Instructor</td>
//                         <td>Seats</td>
//                     </tr>
//                     </thead>
//                     <tbody>
//                     { this.createSections() }
//                     </tbody>
//                 </table>
//                 <div id="additionalInfo" style={{margin: '5px 5px 5px 5px'}}>
//                     <button id="selectSection" className="btn btn-primary">
//                         Done
//                     </button>
//                     <div className="spinner" style={{display:'none'}}>
//                         <div className="rect1"></div>
//                         <div className="rect2"></div>
//                         <div className="rect3"></div>
//                         <div className="rect4"></div>
//                         <div className="rect5"></div>
//                     </div>
//                     <div id="sectionDetails">
//                     </div>
//                 </div>
//             </div>
//         </div>
//     </div>
// </div>


