let React = require('react');
import {connect} from 'react-redux'

import {clickViewCourseTableButton, clickRemoveCourseButton} from '../actions/sectionActions'


@connect(() => {return {}}, mapDispatchToProps)
export default class CourseButtonMainSection extends React.Component {

    constructor(props) {
        super(props);
        this.removeCourse = this.removeCourse.bind(this);
    }

    removeCourse(event) {
        event.stopPropagation();
        this.props.onClickRemoveCourseButton();
    }

    render() {

        const style = {
            borderLeftColor: this.props.color
        };

        const courseButtonSelectedCheck =
            <span className="glyphicon glyphicon-ok course-success courseButtonSelectedCheck"> </span>;

        const removeCourse = <span className="close removeCourse" onClick={this.removeCourse}>×</span>;

        let sectionCount = this.props.dataStatus == "loading"
            ? "Loading Sections" : this.props.sections.length + " Sections";

        let hasCourseButtonCheck = this.props.selected != null;

        let courseNum = `${this.props.department} ${this.props.course}`;

        // TODO - add course revert button (from department button attribute), disable extra sections

        return (
            <a onClick={this.props.onClickViewCourseTable}
               style={style}
               className="list-group-item toggle course-button"
               key={`${courseNum}`}
            >
                <h4 className="list-group-item-heading">
                    <span className="courseNumBox">
                        { courseNum }
                    </span>
                    {hasCourseButtonCheck ? courseButtonSelectedCheck : null}
                    {removeCourse}
                </h4>
                <p className="list-group-item-text">
                <span className="sectionCount">
                    {sectionCount}
                </span>
                <span className="pull-right cache-age"></span>
                </p>
            </a>
        );
    }
}

// Map Redux actions to component props
function mapDispatchToProps(dispatch, sectionProps) {
    return {
        onClickViewCourseTable: () => dispatch(clickViewCourseTableButton(sectionProps.courseId)),
        onClickRemoveCourseButton: () => dispatch(clickRemoveCourseButton(sectionProps.courseId))
    }
}


