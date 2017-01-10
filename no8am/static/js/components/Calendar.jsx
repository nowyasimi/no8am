let React = require('react');

import {DayOfWeek} from './DayOfWeek.jsx';

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export class Calendar extends React.Component {

    static generate_calendar_titles() {
        return DAYS_OF_WEEK.map((day) =>
            <div className="dayweek" key={day}>
                {day.slice(0,3)}<span className="hidden-xs hidden-sm hidden-md">{day.slice(3)}</span>
            </div>
        );
    }

    generate_course_data_divs() {
        return DAYS_OF_WEEK.map((day) =>
            <DayOfWeek key={day} day={day} {...this.props} />
        );
    }

    render() {
        return (
            <div>
                <div id="calendar" className="list-group">
                    <div id="calendar-titles" className="panel-heading">
                        { Calendar.generate_calendar_titles() }
                    </div>
                    <div id="course-data" className="list-group-item">
                        <div className="week">
                            { this.generate_course_data_divs() }
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
