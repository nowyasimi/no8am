let React = require('react');

import {connect} from 'react-redux'

import {EXTRA_SECTION_TYPES, DATA_LOADING_STATE} from '../Constants'
import SectionListCard from './SectionListCard.jsx'


@connect(mapStateToProps, mapDispatchToProps)
export default class SectionList extends React.Component {

    render() {

        let cacheTime = this.props.data.cache_time;
        let searchItem= this.props.item;
        let isExtraSectionIndependent = this.props.data.course.isExtraSectionIndependent;
        let sections = this.props.data.sections;

        let sectionCards = sections.map(section => {

            let lastSectionOfType = sections.filter(otherSection =>
                (this.props.isAdvanced || !this.isUnavailable(otherSection)) &&
                otherSection.course_number == section.course_number &&
                otherSection.department == section.department).pop();

            let isLastOfType = lastSectionOfType != undefined && lastSectionOfType.CRN == section.CRN;

            let isUnavailable = this.isUnavailable(section);

            let isVisible = this.props.isAdvanced || !isUnavailable;

            return (<SectionListCard
                        key={section.CRN}
                        {...section}
                        isLastOfType={isLastOfType}
                        isSelected={this.props.selectedSections.find(selectedSection => selectedSection.CRN == section.CRN)}
                        isUnavailable={isUnavailable}
                        isVisible={isVisible} />
                   );
        });

        return (
            <div className="sectionList">
                {sectionCards}
            </div>
        );
    }

    isUnavailable(section) {
        return this.props.selectedSections.find(selectedSection =>
            section.bare_course_number == selectedSection.bare_course_number &&
            (section.main && !selectedSection.main && !selectedSection.dependent_main_sections.includes(section.sectionNum)) ||
            (!section.main && selectedSection.main && !section.dependent_main_sections.includes(selectedSection.sectionNum))
        );
    }
}

// Map Redux state to component props
function mapStateToProps(state) {
    return {
        selectedSections: state.selectedSections,
        isAdvanced: state.isAdvanced
    }
}

// Map Redux actions to component props
function mapDispatchToProps(dispatch, props) {
    return {

    }
}

