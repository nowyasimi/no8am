let React = require('react');

import { Provider, connect } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'

import { sectionReducer } from "../reducers/sectionReducer"

import {Calendar} from './Calendar.jsx';
import {LeftSide} from './LeftSide.jsx';

import {CalendarSection} from "./CalendarSection.jsx"
import {CourseTableSection} from "./CourseTableSection.jsx"
import {CourseButton} from "./CourseButton.jsx"
import {SectionListModal} from "./SectionListModal.jsx"
import {SectionDetails} from "./SectionDetails.jsx"

import {mouseEnterCalendarSection, mouseLeaveCalendarSection, mouseEnterCourseTableSection,
    mouseLeaveCourseTableSection, highlightCourseTableAndFetchSectionDetails, clickViewCourseTableButton} from "../actions/sectionActions"

const store = createStore(
    sectionReducer,
    applyMiddleware(thunkMiddleware) // lets us dispatch() functions
);

// Map Redux state to component props
function mapStateToProps(state) {
    return {
        hoverCourseId: state.hoverCourseId,
        courseTableHover: {
            courseGroupId: state.courseTableHoverCourseGroupId,
            courseId: state.courseTableHoverCourseId,
            sectionId: state.courseTableHoverSectionId
        },
        highlight: {
            courseGroupId: state.highlightCourseGroupId,
            courseId: state.highlightCourseId,
            sectionId: state.highlightSectionId,
            sectionDetails: state.sectionDetails
        },
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
        onHighlightCourseTable: () => dispatch(highlightCourseTableAndFetchSectionDetails(sectionProps.courseGroupId, sectionProps.courseId, sectionProps.sectionId, sectionProps.department, sectionProps.CRN)),
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
