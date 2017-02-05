let React = require('react');
import {connect} from 'react-redux'
import {ConnectedCourseButtonMainSection} from './CourseButtonMainSection.jsx';
import {ConnectedCourseButtonExtraSection} from './CourseButtonExtraSection.jsx';


export class CourseButtonWrapper extends React.Component {

    render() {

        // TODO - add course revert button (from department button attribute), add remove button, disable extra sections
        // TODO - use this function to add extra sections. Guess number of sections and independence in each type by using first section's extras.

        let extraSectionButtons = [];

        if (this.props.dataStatus == "loaded" && this.props.sections.length > 0) {
            let firstSection = this.props.sections[0];

            for (let extra_section_type in firstSection.extra_section_lists) {
                let numSectionsOfType = firstSection.extra_section_lists[extra_section_type].length;
                if (numSectionsOfType > 0) {
                    extraSectionButtons.push(
                        <ConnectedCourseButtonExtraSection
                            key={`courseId${this.props.courseId}${extra_section_type}`}
                            {...this.props}
                            {...firstSection.extra_section_lists[extra_section_type][0]}
                            extraSectionType={extra_section_type}
                            numSections={numSectionsOfType}
                        />
                    );
                }
            }
        }

        console.log(this.props);

        return (
            <div className="list-group">
                <ConnectedCourseButtonMainSection {...this.props} />

                {extraSectionButtons}
            </div>
        );
    }
}

