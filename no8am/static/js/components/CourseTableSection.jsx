let React = require('react');
import { connect } from 'react-redux'

import {mouseEnterCourseTableSection, mouseLeaveCourseTableSection, highlightCourseTableAndFetchSectionDetails}
from "../actions/sectionActions"


export class CourseTableSection extends React.Component {
    render() {

        let sectionHighlighted = this.props.courseId == this.props.highlight.courseId &&
            this.props.sectionId == this.props.highlight.sectionId;

        let isSelected = this.props.selected == this.props.sectionId || (sectionHighlighted) ? 'success' : '';

        return (
            <tr className={isSelected}
                onClick={() => this.props.onHighlightCourseTable()}
                onMouseEnter={() => this.props.onMouseEnterCourseTable()}
                onMouseLeave={() => this.props.onMouseLeaveCourseTable()}>
                <td> {this.props.courseNum} </td>
                <td> {this.props.timesMet} </td>
                <td> {this.props.roomMet} </td>
                <td> {this.props.professor} </td>
                <td> {this.props.freeSeats} </td>
            </tr>
        );
    }
}

// Map Redux state to component props
function mapStateToProps(state) {
    return {
        highlight: {
            courseId: state.highlightCourseId,
            sectionId: state.highlightSectionId
        }
    }
}

// Map Redux actions to component props
function mapDispatchToProps(dispatch, sectionProps) {
    return {
        onMouseEnterCourseTable: () => dispatch(mouseEnterCourseTableSection(sectionProps.courseId, sectionProps.sectionId)),
        onMouseLeaveCourseTable: () => dispatch(mouseLeaveCourseTableSection()),
        onHighlightCourseTable: () => dispatch(highlightCourseTableAndFetchSectionDetails(sectionProps.courseId, sectionProps.sectionId, sectionProps.department, sectionProps.CRN))
    }
}

export const ConnectedCourseTableSection = connect(
    mapStateToProps,
    mapDispatchToProps
)(CourseTableSection);