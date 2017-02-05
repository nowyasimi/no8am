let React = require('react');
import {connect} from 'react-redux'

import {CourseButtonWrapper} from './CourseButtonWrapper.jsx'

export class CourseButtons extends React.Component {
    render() {
        return (
            <div className="row editRegion" id="courseButtons">
                <div className="col-sm-6" id="buttons-1">
                    {this.props.courses.map((x) => <CourseButtonWrapper key={`courseButton${x.courseId}`} {...x} />)}
                </div>
                <div className="col-sm-6" id="buttons-2">

                </div>
            </div>
        );
    }
}

// Map Redux state to component props
function mapStateToProps(state) {
    return {
        courses: state.courses
    }
}

export const ConnectedCourseButtons = connect(mapStateToProps)(CourseButtons);

