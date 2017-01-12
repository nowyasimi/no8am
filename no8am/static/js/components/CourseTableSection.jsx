let React = require('react');

export class CourseTableSection extends React.Component {
    render() {

        let sectionHighlighted = this.props.courseId == this.props.highlightCourseId &&
            this.props.sectionId == this.props.highlightSectionId;

        let isSelected = this.props.selected == this.props.sectionId || (sectionHighlighted) ? 'success' : '';

        let className = `course${this.props.courseId} section${this.props.sectionId} ${isSelected}`;

        return (
            <tr id={`section${this.props.sectionId}`} className={className}
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
