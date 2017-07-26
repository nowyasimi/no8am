let React = require('react');

import { connect } from 'react-redux'

import {colorDict} from '../Constants'
import {mouseEnterCalendarSection, mouseLeaveCalendarSection, clickViewCourseTableButton} from '../actions/sectionActions.js'


@connect(mapStateToProps, mapDispatchToProps)
export default class CalendarSection extends React.Component {

    render() {
        let sectionMatchesSelected = this.props.selected == this.props.sectionId;

        let sectionMatchesCourseTableHover =
            this.props.courseTableHover.courseId == this.props.courseId &&
            this.props.courseTableHover.sectionId == this.props.sectionId;

        let sectionHighlighted =
            this.props.courseId == this.props.highlight.courseId &&
            this.props.sectionId == this.props.highlight.sectionId;

        let displaySection = sectionMatchesSelected || sectionMatchesCourseTableHover || sectionHighlighted;

        let hexColor = colorDict[this.props.color][sectionMatchesSelected ? "s" : "n"];
        let selectedCalendarSection = sectionMatchesSelected ?  "selectedCalendarSection" : "unselectedCalendarSection";

        let day = this.props.day;
        let daysMet = this.props.daysMet;

        let style = {
            height: (daysMet[day][1] + daysMet[day][2] > 26 ? 25.73 - daysMet[day][1] : daysMet[day][2])*20/5.6 + "%",
            marginTop: daysMet[day][1]*20/5.6 + "%",
            display: displaySection ? 'block' : 'none',
            background: hexColor,
            zIndex: sectionHighlighted || sectionMatchesCourseTableHover ? 5 : 1
        };

        let className = `course${this.props.courseId} section${this.props.sectionId} ${selectedCalendarSection}`;

        let innerDetails = this.props.hoverCourseId == this.props.courseId ?
            <p className="timesMet">{this.props.daysMet[day][3] + "-" + this.props.daysMet[day][4]}</p> :
            <p className="courseNum">{this.props.courseNum.slice(0,-3)}</p>;

        return (
            <li style={style} className={className}
                onClick={() => this.props.onClickViewCourseTable()}
                onMouseEnter={() => this.props.onMouseEnterCalendar()}
                onMouseLeave={() => this.props.onMouseLeaveCalendar()}>
                {innerDetails}
            </li>
        );
    }
}

// Map Redux state to component props
function mapStateToProps(state) {
    return {
        hoverCourseId: state.hoverCourseId,
        courses: state.courses,
        highlight: {
            courseId: state.highlightCourseId,
            sectionId: state.highlightSectionId
        },
        courseTableHover: {
            courseId: state.courseTableHoverCourseId,
            sectionId: state.courseTableHoverSectionId
        }
    }
}

// Map Redux actions to component props
function mapDispatchToProps(dispatch, sectionProps) {
    return {
        onMouseEnterCalendar: () => dispatch(mouseEnterCalendarSection(sectionProps.courseId)),
        onMouseLeaveCalendar: () => dispatch(mouseLeaveCalendarSection()),
        onClickViewCourseTable: () => dispatch(clickViewCourseTableButton(sectionProps.courseId))
    }
}


