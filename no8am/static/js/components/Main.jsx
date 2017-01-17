let React = require('react');

import { connect } from 'react-redux'

import {Calendar} from './Calendar.jsx';
import {LeftSide} from './LeftSide.jsx';

import {CalendarSection} from "./CalendarSection.jsx"
import {CourseTableSection} from "./CourseTableSection.jsx"
import {SearchBox} from "./SearchBox.jsx"
import {CourseButtons} from "./CourseButtons.jsx"
import {CalendarCourses} from './CalendarCourses.jsx';

import {mouseEnterCalendarSection, mouseLeaveCalendarSection, mouseEnterCourseTableSection,
    mouseLeaveCourseTableSection, highlightCourseTableAndFetchSectionDetails, clickViewCourseTableButton,
    fetchNewCourse, closeSectionListModal, clickRemoveCourseButton} from "../actions/sectionActions"


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
        clickedCourseButtonId: state.clickedCourseButtonId,
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
        onClickViewCourseTable: () => dispatch(clickViewCourseTableButton(sectionProps.courseId)),
        onSectionListModalClose: () => dispatch(closeSectionListModal()),
        onClickRemoveCourseButton: () => dispatch(clickRemoveCourseButton())
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

export const ConnectedSearchBox = connect(
    mapStateToProps,
    {onAddNewCourse: fetchNewCourse}
)(SearchBox);

export const ConnectedCourseButtons = connect(
  mapStateToProps,
    mapDispatchToProps
)(CourseButtons);

export const ConnectedCalendarCourses = connect(
    mapStateToProps,
    mapDispatchToProps
)(CalendarCourses);

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
