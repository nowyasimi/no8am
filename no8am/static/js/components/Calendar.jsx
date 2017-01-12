let React = require('react');

import {CalendarCourses} from './CalendarCourses.jsx';

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export class Calendar extends React.Component {

    static generate_calendar_titles() {
        return DAYS_OF_WEEK.map((day) =>
            <div className="dayweek" key={day}>
                {day.slice(0,3)}<span className="hidden-xs hidden-sm hidden-md">{day.slice(3)}</span>
            </div>
        );
    }

    render() {
        return (
            <div className="col-sm-6 page2bg" id="calendar-col">
                <div>
                    <div id="calendar" className="list-group">
                        <div id="calendar-titles" className="panel-heading">
                            { Calendar.generate_calendar_titles() }
                        </div>
                        <CalendarCourses {...this.props} />
                    </div>
                </div>
            </div>
        );
    }
}
