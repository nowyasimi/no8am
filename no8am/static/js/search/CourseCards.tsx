import * as React from 'react'

import {connect} from 'react-redux'

import { Classes, Switch, Tab2, Tabs2 } from "@blueprintjs/core";
import {SEARCH_ITEM_TYPE} from '../Constants'
import {ISection} from '../Interfaces'

const cardContainerStyle = {
    display: "flex",
    flexWrap: "wrap",
};

const cardStyle = {
    flex: "1 1 200px",
    margin: "10px"
};

@(connect(mapStateToProps, mapDispatchToProps) as any)
export default class CourseCards extends React.Component {

    render() {
        return (
            <div style={cardContainerStyle}>
                {/* <div className="pt-card pt-interactive" style={cardStyle}>
                    <h5><a href="#">Search</a></h5>
                    <p></p>
                </div>
                <div className="pt-card pt-interactive" style={cardStyle}>
                    <h5><a href="#">Desk Profile</a></h5>
                    <p>Desk-level summary of trading activity and trading profiles.</p>
                </div>
                <div className="pt-card pt-interactive" style={cardStyle}>
                    <h5><a href="#">Dataset Dashboards</a></h5>
                    <p>Stats of dataset completeness and reference data join percentages.</p>
                </div> */}
            </div>
        );
    }
}

// Map Redux state to component props
function mapStateToProps(state) {
    return {
        selectedSections: state.selectedSections
    }
}

// Map Redux actions to component props
function mapDispatchToProps(dispatch) {
    return {
    }
}

