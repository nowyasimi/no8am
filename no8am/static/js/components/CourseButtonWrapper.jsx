let React = require('react');
import {connect} from 'react-redux'
import CourseButtonMainSection from './CourseButtonMainSection.jsx';
import CourseButtonExtraSection from './CourseButtonExtraSection.jsx';
import {EXTRA_SECTION_TYPES} from '../Constants';


@connect(mapStateToProps)
export default class CourseButtonWrapper extends React.Component {

    render() {

        // TODO - add course revert button (from department button attribute), add remove button, disable extra sections

        let extraSectionButtons = [];

        if (this.props.dataStatus == "loaded" && this.props.sections.length > 0) {

            let isParentSelected = this.props.selected;
            let extraSections = EXTRA_SECTION_TYPES.map(x => this.props.courseId + x);

            extraSectionButtons = this.props.courses
                .filter(course => extraSections.includes(course.courseId))
                .map(x => <CourseButtonExtraSection
                        key={`courseId${x.courseId}`}
                        {...x}
                        isDisabled={!x.isIndependent && !isParentSelected}
                        parentSectionNum={this.props.selected && this.props.sections[this.props.selected].sectionNum}
                    />
                );
        }

        console.log(this.props);

        return (
            <div className="list-group">
                <CourseButtonMainSection {...this.props} />

                {extraSectionButtons}
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

