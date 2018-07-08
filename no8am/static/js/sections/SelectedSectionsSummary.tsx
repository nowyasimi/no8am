import * as React from "react";
import {connect} from "react-redux";

import {Menu} from "@blueprintjs/core";
import {Cell, Column, CopyCellsMenuItem, IMenuContext, Table} from "@blueprintjs/table";

import {getSelectedSections} from "../Helpers";
import {IAllReducers, SectionWithColor} from "../Interfaces";

const totalClassHoursStyle: React.CSSProperties = {
    fontSize: "16px",
    marginBottom: "10px",
    textAlign: "center",
};

interface ISelectedSectionsSummaryStateProps {
    selectedSections: SectionWithColor[];
}

class SelectedSectionsSummary extends React.Component<ISelectedSectionsSummaryStateProps> {

    public render() {
        const numberOfSelectedSections = this.props.selectedSections.length;

        return numberOfSelectedSections === 0 ? null : (
            <div>
                <div style={totalClassHoursStyle}>
                    {this.calculateTotalClassHours()} class hours
                </div>
                <Table
                    numRows={numberOfSelectedSections}
                    bodyContextMenuRenderer={this.renderBodyContextMenu}
                    columnWidths={[100, 60, 60, 60, 60, 80]}
                >
                    <Column name="Course Number" cellRenderer={this.renderCell} />
                    <Column name="CRN" cellRenderer={this.renderCell} />
                    <Column name="Title" cellRenderer={this.renderCell} />
                    <Column name="Credits" cellRenderer={this.renderCell} />
                    <Column name="CCCs" cellRenderer={this.renderCell} />
                    <Column name="Professors" cellRenderer={this.renderCell} />
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

const SelectedSectionsSummaryConnected = connect((state: IAllReducers): ISelectedSectionsSummaryStateProps => ({
    selectedSections: getSelectedSections(state),
}))(SelectedSectionsSummary);

export default SelectedSectionsSummaryConnected;
