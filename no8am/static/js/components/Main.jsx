let React = require('react');

import { connect } from 'react-redux'

import {Calendar} from './Calendar.jsx';
import {LeftSide} from './LeftSide.jsx';

import {CalendarSection} from "./CalendarSection.jsx"
import {CourseTableSection} from "./CourseTableSection.jsx"
import {CourseButton} from "./CourseButton.jsx"
import {SectionListModal} from "./SectionListModal.jsx"
import {SectionDetails} from "./SectionDetails.jsx"
import {SearchBox} from "./SearchBox.jsx"
import {CourseButtons} from "./CourseButtons.jsx"

import {mouseEnterCalendarSection, mouseLeaveCalendarSection, mouseEnterCourseTableSection,
    mouseLeaveCourseTableSection, highlightCourseTableAndFetchSectionDetails, clickViewCourseTableButton,
    fetchNewCourse} from "../actions/sectionActions"


// Map Redux state to component props
function mapStateToProps(state) {
    return {
        hoverCourseId: state.hoverCourseId,
        courseTableHover: {
            courseId: state.courseTableHoverCourseId,
            sectionId: state.courseTableHoverSectionId
        },
        highlight: {
            courseId: state.highlightCourseId,
            sectionId: state.highlightSectionId,
            sectionDetails: state.sectionDetails
        },
        lastClickedViewSectionsButton: state.lastClickedViewSectionsButton,
        courses: state.courses
    }
}

// Map Redux actions to component props
function mapDispatchToProps(dispatch, sectionProps) {
    return {
        onMouseEnterCalendar: () => dispatch(mouseEnterCalendarSection(sectionProps.courseId)),
        onMouseLeaveCalendar: () => dispatch(mouseLeaveCalendarSection()),
        onMouseEnterCourseTable: () => dispatch(mouseEnterCourseTableSection(sectionProps.courseId, sectionProps.sectionId)),
        onMouseLeaveCourseTable: () => dispatch(mouseLeaveCourseTableSection()),
        onHighlightCourseTable: () => dispatch(highlightCourseTableAndFetchSectionDetails(sectionProps.courseId, sectionProps.sectionId, sectionProps.department, sectionProps.CRN)),
        onClickViewCourseTable: () => dispatch(clickViewCourseTableButton("course", sectionProps.courseId))
    }
}

// Connected Component
export const ConnectedCalendarSection = connect(
    mapStateToProps,
    mapDispatchToProps
)(CalendarSection);

export const ConnectedCourseTableSection = connect(
    mapStateToProps,
    mapDispatchToProps
)(CourseTableSection);

export const ConnectedCourseButton = connect(
    mapStateToProps,
    mapDispatchToProps
)(CourseButton);

export const ConnectedSectionListModal = connect(
    mapStateToProps,
    mapDispatchToProps
)(SectionListModal);

export const ConnectedSectionDetails = connect(
    mapStateToProps,
    mapDispatchToProps
)(SectionDetails);

export const ConnectedSearchBox = connect(
    mapStateToProps,
    {onAddNewCourse: fetchNewCourse}
)(SearchBox);

export const ConnectedCourseButtons = connect(
  mapStateToProps,
    mapDispatchToProps
)(CourseButtons);



export class Main extends React.Component {

    render() {
        return (
            <div>
                <LeftSide {...this.props} />
                <Calendar {...this.props} />
            </div>
        );
    }

}
