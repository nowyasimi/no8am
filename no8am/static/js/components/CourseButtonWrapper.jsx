let React = require('react');
import {connect} from 'react-redux'
import CourseButtonMainSection from './CourseButtonMainSection.jsx';
import CourseButtonExtraSection from './CourseButtonExtraSection.jsx';
import {EXTRA_SECTION_TYPES} from '../Constants';


@connect(mapStateToProps)
export default class CourseButtonWrapper extends React.Component {

    render() {

        // TODO - add course revert button (from department button attribute), add remove button, disable extra sections
        // TODO - use this function to add extra sections. Guess number of sections and independence in each type by using first section's extras.

        let extraSectionButtons = [];

        if (this.props.dataStatus == "loaded" && this.props.sections.length > 0) {
            let firstSection = this.props.sections[0];

            let independentExtraSections = EXTRA_SECTION_TYPES.map(x => this.props.courseId + x);

            extraSectionButtons = this.props.courses
                .filter(course => independentExtraSections.includes(course.courseId))
                .map(x => <CourseButtonExtraSection
                        key={`courseId${x.courseId}`}
                        {...x}
                        numSections={x.sections.length}
                        isDependent={false} />
                );

            for (let extra_section_type in firstSection.extra_section_lists) {
                let numSectionsOfType = firstSection.extra_section_lists[extra_section_type].length;
                if (numSectionsOfType > 0) {
                    extraSectionButtons.push(
                        <CourseButtonExtraSection
                            key={`courseId${this.props.courseId}${extra_section_type}`}
                            courseId={this.props.courseId}
                            course={this.props.course}
                            mainSelection={this.props.selected}
                            {...firstSection.extra_section_lists[extra_section_type][0]}
                            extraSectionType={extra_section_type}
                            numSections={numSectionsOfType}
                            isDependent={true}
                        />
                    );
                }
            }
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

