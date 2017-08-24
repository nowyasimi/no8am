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
        let sectionCards = sections.map((section, index) => {
            let nextSection = sections[index + 1];

            let isLastOfType = nextSection == undefined || nextSection.course_number != section.course_number ||
                (nextSection.course_number == section.course_number && nextSection.department != section.department);

            return <SectionListCard
                key={section.CRN}
                {...section}
                isLastOfType={isLastOfType}
            />
        });

        return (
            <div className="sectionList">
                {sectionCards}
            </div>
        );
    }
}

// Map Redux state to component props
function mapStateToProps(state) {
    return {
    }
}

// Map Redux actions to component props
function mapDispatchToProps(dispatch, props) {
    return {

    }
}

