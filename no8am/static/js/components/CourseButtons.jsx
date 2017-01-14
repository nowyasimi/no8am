let React = require('react');

import {ConnectedCourseButton} from './main.jsx'

export class CourseButtons extends React.Component {
    render() {
        return (
            <div className="row editRegion" id="courseButtons">
                <div className="col-sm-6" id="buttons-1">
                    {this.props.courses.map((x) =>
                        <ConnectedCourseButton
                            clickEvent={this.props.onClickViewCourseTable} key={`courseButton${x.courseId}`} {...x} />)}
                </div>
                <div className="col-sm-6" id="buttons-2">

                </div>
            </div>
        );
    }
}
