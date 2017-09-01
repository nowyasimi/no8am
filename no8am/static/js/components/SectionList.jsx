let React = require('react');

import {connect} from 'react-redux'
import TimeAgo from 'react-timeago'
import buildFormatter from 'react-timeago/lib/formatters/buildFormatter'
import englishStrings from 'react-timeago/lib/language-strings/en'
import {Tag} from '@blueprintjs/core'

import {clickRemoveShowSingleCourse} from '../actions/sectionActions'

import SectionListCard from './SectionListCard.jsx'
import FilterTime from './FilterTime.jsx'


@connect(mapStateToProps, mapDispatchToProps)
export default class SectionList extends React.Component {

    render() {
        const formatter = buildFormatter(englishStrings);

        let cacheTime = this.props.data.cache_time || new Date();
        let searchItem= this.props.item;
        let sections = this.props.data.sections;

        let showSingleCourseTag = this.props.showSingleCourse == null ? null :
            (<Tag className="pt-large" onRemove={this.props.onClickRemoveShowSingleCourse}>
                {this.props.showSingleCourse}
            </Tag>);

        let sectionCards = sections.map(section => {

            let isVisible = this.isVisible(section);

            let lastSectionOfType = sections.filter(maybeSectionOfType => isVisible && this.isVisible(maybeSectionOfType) &&
                maybeSectionOfType.departmentAndCourse == section.departmentAndCourse).pop();

            let isLastOfType = lastSectionOfType != undefined && lastSectionOfType.CRN == section.CRN;

            return (<SectionListCard
                        key={section.CRN}
                        {...section}
                        isLastOfType={isLastOfType}
                        isSelected={this.props.selectedSections.find(selectedSection => selectedSection.CRN == section.CRN)}
                        isUnavailable={this.isUnavailable(section)}
                        isVisible={isVisible}
                        shouldAskShowSingleCourse={section.departmentAndCourse == this.props.askShowSingleCourse && isLastOfType} />
                   );
        });

        return (
            <div className="sectionList">
                {showSingleCourseTag}
                <TimeAgo date={cacheTime} formatter={formatter} />
                <FilterTime filterTime={this.props.filterTime} />
                {sectionCards}
            </div>
        );
    }

    isUnavailable(section) {
        return this.props.selectedSections.find(selectedSection =>
            section.departmentAndBareCourse == selectedSection.departmentAndBareCourse &&
            ((section.main && !selectedSection.main && !selectedSection.dependent_main_sections.includes(section.sectionNum)) ||
            (!section.main && selectedSection.main && !section.dependent_main_sections.includes(selectedSection.sectionNum)))
        );
    }

    isVisible(section) {
        return (this.props.isAdvanced || !this.isUnavailable(section)) &&
               (this.props.showSingleCourse == null || this.props.showSingleCourse == section.departmentAndBareCourse) &&
               (section.daysMet.every(meetingTime => meetingTime[1] >= this.props.filterTime[0] &&
                                    meetingTime[2] + meetingTime[1] <= this.props.filterTime[1]));
    }
}

// Map Redux state to component props
function mapStateToProps(state) {
    return {
        selectedSections: state.selectedSections,
        isAdvanced: state.isAdvanced,
        askShowSingleCourse: state.askShowSingleCourse,
        showSingleCourse: state.showSingleCourse,
        filterTime: state.filterTime
    }
}

// Map Redux actions to component props
function mapDispatchToProps(dispatch) {
    return {
        onClickRemoveShowSingleCourse: () => dispatch(clickRemoveShowSingleCourse())
    }
}

