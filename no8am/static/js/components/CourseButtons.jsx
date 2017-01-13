let React = require('react');

import {ConnectedCourseButton} from './main.jsx'

export class CourseButtons extends React.Component {

    generateCourseButtons() {
        let courseButtons = [];

        for (let courseId in this.props.schedule.course) {
            let course = this.props.schedule.course[courseId];
            courseButtons.push(
                <ConnectedCourseButton clickEvent={this.props.onClickViewCourseTable} key={`courseButton${courseId}`} courseId={courseId} {...course} />
            )
        }

        return courseButtons;
    }

    render() {
        return (
            <div className="row editRegion" id="courseButtons">
                <div className="col-sm-6" id="buttons-1">
                    {this.generateCourseButtons()}
                </div>
                <div className="col-sm-6" id="buttons-2">

                </div>
            </div>
        );
    }

}
