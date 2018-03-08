import * as React from "react";

import {Menu} from "@blueprintjs/core";
import {Cell, Column, CopyCellsMenuItem, IMenuContext, Table} from "@blueprintjs/table";

import {connect} from "../Connect";
import {getSelectedSections} from "../Helpers";
import {IAllReducers, SectionWithColor} from "../Interfaces";

const totalClassHoursStyle = {
    fontSize: "16px",
    marginBottom: "10px",
    textAlign: "center",
};

interface ISelectedSectionsSummaryStateProps {
    selectedSections: SectionWithColor[];
}

@connect<ISelectedSectionsSummaryStateProps, {}, {}>(mapStateToProps)
export default class SelectedSectionsSummary
    extends React.Component<ISelectedSectionsSummaryStateProps> {

    public render() {
        const numberOfSelectedSections = this.props.selectedSections.length;

        return numberOfSelectedSections === 0 ? null : (
            <div>
                <div style={totalClassHoursStyle}>
                    {this.calculateTotalClassHours()} class hours
                </div>
                <Table
                    numRows={numberOfSelectedSections}
                    renderBodyContextMenu={this.renderBodyContextMenu}
                >
                    <Column name="Course Number" renderCell={this.renderCell} />
                    <Column name="CRN" renderCell={this.renderCell} />
                    <Column name="Title" renderCell={this.renderCell} />
                    <Column name="Credits" renderCell={this.renderCell} />
                    <Column name="CCCs" renderCell={this.renderCell} />
                    <Column name="Professors" renderCell={this.renderCell} />
                </Table>
            </div>
        );
    }

    private renderBodyContextMenu = (context: IMenuContext) => (
        <Menu>
            <CopyCellsMenuItem context={context} getCellData={this.getCellData} text="Copy" />
        </Menu>
    )

    private renderCell = (rowIndex: number, columnIndex: number) => (
        <Cell>
            {this.getCellData(rowIndex, columnIndex)}
        </Cell>
    )

    private getCellData = (rowIndex: number, columnIndex: number) => {
        const section = this.props.selectedSections[rowIndex];

        switch (columnIndex) {
            case 0:
                return section.departmentAndCourseAndSection;
            case 1:
                return section.CRN;
            case 2:
                return section.courseName;
            case 3:
                return section.credits;
            case 4:
                return section.CCC.join(",");
            case 5:
                return section.professor.join(";");
        }
    }

    private calculateTotalClassHours = () => this.props.selectedSections.reduce(
        (totalHours, currentSelectedSection) => totalHours + this.calculateSectionHours(currentSelectedSection), 0)

    private calculateSectionHours = (section: SectionWithColor) => section.meetingTimes.reduce(
        (totalHours, currentMeetingTime) => totalHours + Math.round(currentMeetingTime.duration) / 2, 0)
}

function mapStateToProps(state: IAllReducers): ISelectedSectionsSummaryStateProps {
    return {
        selectedSections: getSelectedSections(state),
    };
}
