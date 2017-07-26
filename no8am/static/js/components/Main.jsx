let React = require('react');

import LeftSide from './LeftSide.jsx';
import Calendar from './Calendar.jsx';

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
