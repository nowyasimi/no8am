let React = require('react');

export class CourseButton extends React.Component {

    render() {
        let style = {
            borderLeftColor: this.props.color
        };

        let sections = this.props.sections;
        let sectionCount = this.props.loadingStatus == "loading" || sections == undefined ? "Loading Sections" : sections.length + " Sections";

        // TODO - add course revert button (from department button attribute), add remove button

        return (
            <div className="list-group">
                <a onClick={this.props.onClickViewCourseTable} style={style} className="list-group-item toggle course-button">
                    <h4 className="list-group-item-heading">
                        <span className="courseNumBox">
                            { this.props.courseNum }
                        </span>
                        <span className="glyphicon glyphicon-ok course-success courseButtonSelectedCheck">
                        </span>
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
