let React = require('react');

import {CalendarSection} from "./CalendarSection.jsx";

export class DayOfWeek extends React.Component {

    // Always draw selected sections
    // Draw potential sections for currently selected course or course group
    // No selected sections to worry about for course groups

    create_selected_sections() {

        // let selected_courses = Object.keys(this.props.selected).map((course_id) =>
        //     course_id !== null
        // );
        //
        //
        //
        // for (let y in this.props.schedule.course) {
        //     this.props.schedule.course[y].courseDrawToScreen(y, this.selected[y], y!=this.lastClickedCourseButton.id);
        // }


    }

    create_course_group_sections() {

    }

    render() {
        return (
            <div className="day" id={ this.props.day[0] }>
                <div className="open">
                    <ul className="list-unstyled">
                        { this.create_selected_sections() }
                        { this.create_course_group_sections() }
                    </ul>
                </div>
            </div>
        );
    }
}
