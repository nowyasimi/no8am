let React = require('react');

import {Calendar} from './Calendar.jsx';
import {LeftSide} from './LeftSide.jsx';

import { createStore } from 'redux'
import { Provider, connect } from 'react-redux'
import { sectionReducer } from "../reducers/sectionReducer"

import {CalendarSection} from "./CalendarSection.jsx"
import {CourseTableSection} from "./CourseTableSection.jsx"
import {CourseButton} from "./CourseButton.jsx"
import {SectionListModal} from "./SectionListModal.jsx"

import {mouseEnterCalendarSection, mouseLeaveCalendarSection, mouseEnterCourseTableSection,
    mouseLeaveCourseTableSection, highlightCourseTableSection, clickViewCourseTableButton} from "../actions/sectionActions"

const store = createStore(sectionReducer);

// Map Redux state to component props
function mapStateToProps(state) {
    return {
        hoverCourseId: state.hoverCourseId,
        courseTableHoverCourseGroupId: state.courseTableHoverCourseGroupId,
        courseTableHoverCourseId: state.courseTableHoverCourseId,
        courseTableHoverSectionId: state.courseTableHoverSectionId,
        highlightCourseGroupId: state.highlightCourseGroupId,
        highlightCourseId: state.highlightCourseId,
        highlightSectionId: state.highlightSectionId,
        lastClickedViewSectionsButton: state.lastClickedViewSectionsButton
    }
}

// Map Redux actions to component props
function mapDispatchToProps(dispatch, sectionProps) {
    return {
        onMouseEnterCalendar: () => dispatch(mouseEnterCalendarSection(sectionProps.courseId)),
        onMouseLeaveCalendar: () => dispatch(mouseLeaveCalendarSection()),
        onMouseEnterCourseTable: () => dispatch(mouseEnterCourseTableSection(sectionProps.courseGroupId, sectionProps.courseId, sectionProps.sectionId)),
        onMouseLeaveCourseTable: () => dispatch(mouseLeaveCourseTableSection()),
        onHighlightCourseTable: () => dispatch(highlightCourseTableSection(sectionProps.courseGroupId, sectionProps.courseId, sectionProps.sectionId)),
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

export class Main extends React.Component {

    render() {
        return (
            <Provider store={store}>
                <div>
                    <LeftSide {...this.props} />
                    <Calendar {...this.props} />
                </div>
            </Provider>
        );
    }

}
