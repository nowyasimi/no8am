import * as React from "react";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";

import {Button, Menu, MenuItem, Popover, Position, RangeSlider} from "@blueprintjs/core";
import {IconNames} from "@blueprintjs/icons";

import {updateFilterTime} from "./FilterActions";
import {initialState} from "./FilterReducer";

type IFilterTime = [number, number];

interface IFilterTimeProps {
    filterTime: IFilterTime;
}

interface IFilterTimeDispatchProps {
    onUpdateFilterTime: typeof updateFilterTime;
}

class FilterTime extends React.Component<IFilterTimeDispatchProps & IFilterTimeProps> {

    public render() {
        return (
            <Popover
                content={this.createPopoverContent()}
                position={Position.RIGHT_TOP}
            >
                <Button
                    icon={IconNames.TIME}
                    text={this.renderButtonText()}
                    rightIcon={IconNames.CARET_RIGHT}
                    className="filterTimeButton"
                />
            </Popover>
        );
    }

    private createPopoverContent() {
        return (
            <Menu>
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
                        min={initialState.filterTime[0]}
                        max={initialState.filterTime[1]}
                        stepSize={2}
                        labelStepSize={10}
                        labelRenderer={renderLabel}
                        onChange={this.props.onUpdateFilterTime}
                        value={this.props.filterTime}
                    />
                </div>
            </Menu>
        );
    }

    private renderButtonText() {
        const startFilter = this.props.filterTime[0];
        const endFilter = this.props.filterTime[1];

        if (startFilter === initialState.filterTime[0] && endFilter === initialState.filterTime[1]) {
            return "Any time";
        } else {
            return `${renderLabel(startFilter)} - ${renderLabel(endFilter)}`;
        }
    }

    private updateFilterTimeAnyTime = () => this.props.onUpdateFilterTime(initialState.filterTime);

    private updateFilterTimeMorning = () => this.props.onUpdateFilterTime([0, 8]);

    private updateFilterTimeAfternoon = () => this.props.onUpdateFilterTime([8, 18]);

    private updateFilterTimeEvening = () => this.props.onUpdateFilterTime([18, 28]);
}

const renderLabel = (value: any) => {
    const hour = value / 2 + 8;
    const amOrPmString = hour < 12 ? "am" : "pm";
    const hourString = hour > 12 ? hour - 12 : hour;
    return hourString + amOrPmString;
};

const FilterTimeConnected = connect(
    () => ({}),
    (dispatch) => bindActionCreators({
        onUpdateFilterTime: (filterTime: [number, number]) => updateFilterTime(filterTime),
    }, dispatch),
)(FilterTime);

export default FilterTimeConnected;
