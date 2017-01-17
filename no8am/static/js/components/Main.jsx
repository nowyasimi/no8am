let React = require('react');

import {Calendar} from './Calendar.jsx';
import {LeftSide} from './LeftSide.jsx';

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
