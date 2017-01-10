let React = require('react');

export class DayOfWeek extends React.Component {
    render() {
        return (
            <div className="day" id={ this.props.day[0] }>
                <div className="open">
                    <ul className="list-unstyled">
                    </ul>
                </div>
            </div>
        );
    }
}
