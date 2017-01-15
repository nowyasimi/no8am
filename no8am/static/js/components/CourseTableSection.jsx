let React = require('react');

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
