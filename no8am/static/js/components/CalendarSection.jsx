let React = require('react');

import { connect } from 'react-redux'

import {colorDict} from '../Constants'
import {mouseEnterCalendarSection, mouseLeaveCalendarSection, clickViewCourseTableButton} from '../actions/sectionActions.js'


@connect(mapStateToProps, mapDispatchToProps)
export default class CalendarSection extends React.Component {

    render() {

        let hexColor = colorDict["blue"][this.props.isSelected ? "s" : "n"];

        let day = this.props.day;
        let daysMet = this.props.daysMet;

        let style = {
            height: (daysMet[day][1] + daysMet[day][2] > 26 ? 25.73 - daysMet[day][1] : daysMet[day][2])*20/5.6 + "%",
            marginTop: daysMet[day][1]*20/5.6 + "%",
            display:  'block',
            background: hexColor,
            zIndex: this.props.isSelected ? 1 : 5
        };

        let className = this.props.isSelected ?  "selectedCalendarSection" : "unselectedCalendarSection";

        let innerDetails = this.props.hoverCRN == this.props.CRN ?
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
        hoverCRN: state.hoverCRN,
        highlight: {
            courseId: state.highlightCourseId,
            sectionId: state.highlightSectionId
        }
    }
}

// Map Redux actions to component props
function mapDispatchToProps(dispatch, sectionProps) {
    return {
        onMouseEnterCalendar: () => dispatch(mouseEnterCalendarSection(sectionProps.CRN)),
        onMouseLeaveCalendar: () => dispatch(mouseLeaveCalendarSection()),
        onClickViewCourseTable: () => dispatch(clickViewCourseTableButton(sectionProps.courseId))
    }
}


