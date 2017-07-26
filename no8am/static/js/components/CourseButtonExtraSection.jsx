let React = require('react');
import {connect} from 'react-redux'

import {clickViewCourseTableButton} from '../actions/sectionActions'

class CourseButtonExtraSection extends React.Component {

    render() {
        console.log(this.props);
        const style = {
            borderLeftColor: this.props.color
        };

        let courseButtonCheck = this.props.selected != null ?
            <span className="glyphicon glyphicon-ok course-success courseButtonSelectedCheck"> </span> : null;

        let courseNum = `${this.props.department} ${this.props.course}${this.props.extraSectionType || ""}`;
        let sectionCountString = `${this.props.numSections} Sections`;
        let disabled = this.props.isDependent && this.props.mainSelection === undefined ? "disabled" : "";

        return (
            <a onClick={this.props.onClickViewCourseTable}
               style={style}
               className={`list-group-item toggle course-button ${disabled}`}
               key={courseNum}
            >
                <h4 className="list-group-item-heading">
                    <span className="courseNumBox">
                        { courseNum }
                    </span>
                    {courseButtonCheck}
                </h4>
                <p className="list-group-item-text">
                    <span className="sectionCount">
                        {sectionCountString}
                    </span>
                </p>
            </a>
        );
    }
}

// Map Redux actions to component props
function mapDispatchToProps(dispatch, sectionProps) {
    return {
        onClickViewCourseTable: () => dispatch(clickViewCourseTableButton(sectionProps.courseId, sectionProps.extraSectionType))
    }
}

export const ConnectedCourseButtonExtraSection = connect(() => {return {}}, mapDispatchToProps)(CourseButtonExtraSection);

