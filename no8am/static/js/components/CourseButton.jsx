let React = require('react');

export class CourseButton extends React.Component {

    removeCourse(event) {
        console.log('remove');
        event.stopPropagation();
        this.props.onClickRemoveCourseButton();
    }

    render() {
        let style = {
            borderLeftColor: this.props.color
        };

        let sectionCount = this.props.dataStatus == "loading"
            ? "Loading Sections" : this.props.sections.length + " Sections";

        let courseButtonSelectedCheck = this.props.selected == null ?
            <span> </span> :
            <span className="glyphicon glyphicon-ok course-success courseButtonSelectedCheck"> </span>;

        let removeCourse = <span className="close removeCourse" onClick={() => this.removeCourse}>×</span>;


        // TODO - add course revert button (from department button attribute), add remove button, disable extra sections

        return (
            <div className="list-group">
                <a onClick={this.props.onClickViewCourseTable} style={style} className="list-group-item toggle course-button">
                    <h4 className="list-group-item-heading">
                        <span className="courseNumBox">
                            { `${this.props.department} ${this.props.course}` }
                        </span>
                        {courseButtonSelectedCheck}
                        {removeCourse}
                    </h4>
                    <p className="list-group-item-text">
                        <span className="sectionCount">
                            {sectionCount}
                        </span>
                        <span className="pull-right cache-age"></span>
                    </p>
                </a>
            </div>
        );
    }

}
