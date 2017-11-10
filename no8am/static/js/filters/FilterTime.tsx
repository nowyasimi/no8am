import * as React from "react";
import {connect} from "react-redux";

import {Button, Menu, MenuItem, Popover, Position, RangeSlider} from "@blueprintjs/core";

import {updateFilterTime} from "./FilterActions";
import {defaultFilters} from "./FilterReducer";

interface IFilterTimeProps {
    filterTime: [number, number];
    onUpdateFilterTime?: (filterTime) => Promise<void>;
}

/* tslint:disable:no-empty */
@(connect(() => {}, mapDispatchToProps) as any)
export default class FilterTime extends React.Component<IFilterTimeProps, undefined> {

    public render() {
        return (
            <Popover
                content={this.createPopoverContent()}
                position={Position.RIGHT_TOP}
            >
                <Button
                    iconName="time"
                    text={this.renderButtonText()}
                    rightIconName="caret-right"
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
                        min={defaultFilters.filterTime[0]}
                        max={defaultFilters.filterTime[1]}
                        stepSize={2}
                        labelStepSize={10}
                        renderLabel={renderLabel}
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

        if (startFilter === defaultFilters.filterTime[0] && endFilter === defaultFilters.filterTime[1]) {
            return "Any time";
        } else {
            return `${renderLabel(startFilter)} - ${renderLabel(endFilter)}`;
        }
    }

    private updateFilterTimeAnyTime = () => this.props.onUpdateFilterTime(defaultFilters.filterTime);

    private updateFilterTimeMorning = () => this.props.onUpdateFilterTime([0, 8]);

    private updateFilterTimeAfternoon = () => this.props.onUpdateFilterTime([8, 18]);

    private updateFilterTimeEvening = () => this.props.onUpdateFilterTime([18, 28]);
}

const renderLabel = (value) => {
    const hour = value / 2 + 8;
    const amOrPmString = hour < 12 ? "am" : "pm";
    const hourString = hour > 12 ? hour - 12 : hour;
    return hourString + amOrPmString;
};

function mapDispatchToProps(dispatch) {
    return {
        onUpdateFilterTime: (filterTime) => dispatch(updateFilterTime(filterTime)),
    };
}
