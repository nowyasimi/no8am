import * as React from 'react'

import {connect} from 'react-redux'

import {Button, Menu, MenuItem, Popover, Position, RangeSlider} from '@blueprintjs/core'

import {updateFilterTime} from '../actions/sectionActions'
import {defaultFilters} from '../reducers/sectionReducer'

interface FilterTimeProps {
    filterTime: [number, number]
    onUpdateFilterTime?: (filterTime) => Promise<void>
}

@(connect(mapStateToProps, mapDispatchToProps) as any)
export default class FilterTime extends React.Component<FilterTimeProps, undefined> {

    render() {
       return (
           <Popover content={<Menu>
                   <MenuItem
                       text="Any time"
                       onClick={this.updateFilterTimeAnyTime}
                   />
                   <MenuItem
                       text="Morning"
                       onClick={this.updateFilterTimeMorning}
                   />
                   <MenuItem
                       text="Afternoon"
                       onClick={this.updateFilterTimeAfternoon}
                   />
                   <MenuItem
                       text="Evening"
                       onClick={this.updateFilterTimeEvening}
                   />
                   <div className="rangeSliderContainer">
                       <RangeSlider
                           min={defaultFilters.filterTime[0]}
                           max={defaultFilters.filterTime[1]}
                           stepSize={2}
                           labelStepSize={10}
                           renderLabel={renderLabel}
                           onChange={this.props.onUpdateFilterTime}
                           value={this.props.filterTime}
                       />
                   </div>
               </Menu>}
                    position={Position.RIGHT_TOP}>
               <Button
                   iconName="time"
                   text={this.renderButtonText()}
                   rightIconName="caret-right"
                   className="filterTimeButton" />
           </Popover>
       );
    }

    renderButtonText() {
        let startFilter = this.props.filterTime[0];
        let endFilter = this.props.filterTime[1];

        if (startFilter == defaultFilters.filterTime[0] && endFilter == defaultFilters.filterTime[1]) {
            return "Any time";
        } else {
            return `${renderLabel(startFilter)} - ${renderLabel(endFilter)}`;
        }
    }

    updateFilterTimeAnyTime = () => this.props.onUpdateFilterTime(defaultFilters.filterTime);

    updateFilterTimeMorning = () => this.props.onUpdateFilterTime([0, 8]);

    updateFilterTimeAfternoon = () => this.props.onUpdateFilterTime([8, 18]);

    updateFilterTimeEvening = () => this.props.onUpdateFilterTime([18, 28]);
}

const renderLabel = (value) => {
    let hour = value/2 + 8;
    let amOrPmString = hour < 12 ? "am" : "pm";
    let hourString = hour > 12 ? hour - 12 : hour;
    return hourString + amOrPmString;
};


function mapStateToProps(state) {
    return {

    }
}


function mapDispatchToProps(dispatch) {
    return {
        onUpdateFilterTime: (filterTime) => dispatch(updateFilterTime(filterTime))
    }
}
