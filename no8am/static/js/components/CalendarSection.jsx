let React = require('react');

import {colorDict} from '../Constants'

export class CalendarSection extends React.Component {

    constructor(props) {
        super(props);
    }

    /**
     * Called when a section in the calendar is clicked. Opens the course table modal
     * for that course.
     */
    handleClick() {
        sched.lastClickedCourseButton = {"type": "course", "id": this.props.courseId};
        sched.redrawData();
        $("#courseTable").modal();
    }

    render() {
        let day = this.props.day;
        let daysMet = this.props.daysMet;

        let sectionMatchesSelected = this.props.selected == this.props.sectionId;
        let hexColor = colorDict[this.props.color][sectionMatchesSelected ? "s" : "n"];
        let selectedCalendarSection = sectionMatchesSelected ?  "selectedCalendarSection" : "unselectedCalendarSection";

        let style = {
            height: (daysMet[day][1] + daysMet[day][2] > 26 ? 25.73 - daysMet[day][1] : daysMet[day][2])*20/5.6 + "%",
            marginTop: daysMet[day][1]*20/5.6 + "%",
            display: sectionMatchesSelected ? 'block' : 'none',
            background: hexColor
        };

        let className = `course${this.props.courseId} section${this.props.sectionId} ${selectedCalendarSection}`;

        let innerDetails = this.props.hover && this.props.hoverCourseId == this.props.courseId ?
            <p className="timesMet">{this.props.daysMet[day][3] + "-" + this.props.daysMet[day][4]}</p> :
            <p className="courseNum">{this.props.courseNum.slice(0,-3)}</p>;

        return (
            <li style={style} className={className} data-dept-num={this.props.courseGroupId}
                onClick={this.handleClick.bind(this)}
                onMouseEnter={() => this.props.onMouseEnter()}
                onMouseLeave={() => this.props.onMouseLeave()}>
                {innerDetails}
            </li>
        );
    }
}
