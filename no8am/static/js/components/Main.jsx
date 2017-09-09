let React = require('react');

import {connect} from 'react-redux'

import {loadSections} from '../actions/sectionActions'

import LeftSide from './LeftSide.jsx';
import Calendar from './Calendar.jsx';

@connect(mapStateToProps, mapDispatchToProps)
export class Main extends React.Component {

    componentDidMount() {
        this.props.onLoadSections()
    }

    render() {
        return (
            <div>
                <LeftSide {...this.props} />
                <Calendar {...this.props} />
            </div>
        );
    }

}

// Map Redux state to component props
function mapStateToProps(state) {
    return {}
}

// Map Redux actions to component props
function mapDispatchToProps(dispatch) {
    return {
        onLoadSections: () => dispatch(loadSections())
    }
}


