let React = require('react');
import {connect} from 'react-redux'

import {ConnectedCourseButtonWrapper} from './CourseButtonWrapper.jsx'

export class CourseButtons extends React.Component {
    render() {
        return (
            <div className="row editRegion" id="courseButtons">
                <div className="col-sm-6" id="buttons-1">
                    {this.props.courses
                        .filter(x => x.isMain)
                        .map((x) => <ConnectedCourseButtonWrapper key={`courseButton${x.courseId}`} {...x} />)
                    }
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

