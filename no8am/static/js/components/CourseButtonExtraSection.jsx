let React = require('react');
import {connect} from 'react-redux'

import {clickViewCourseTableButton} from '../actions/sectionActions'


@connect(() => {return {}}, mapDispatchToProps)
export default class CourseButtonExtraSection extends React.Component {

    render() {
        const style = {
            borderLeftColor: this.props.color
        };

        let courseButtonCheck = this.props.selected != null ?
            <span className="glyphicon glyphicon-ok course-success courseButtonSelectedCheck"> </span> : null;

        let courseNum = `${this.props.department} ${this.props.course}${this.props.extraSectionType || ""}`;

        let numSections = this.props.parentSectionNum === undefined ? this.props.sections.length : this.props.sections
                .filter(section => section.dependent_main_sections.includes(this.props.parentSectionNum)).length;
        let sectionCountString = this.props.isDisabled ? "Select Main Section First" : `${numSections} Sections`;

        let disabled = this.props.isDisabled ? "disabled" : "";

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


