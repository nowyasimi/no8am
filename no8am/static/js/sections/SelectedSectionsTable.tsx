import * as React from "react";

import {Menu} from "@blueprintjs/core";
import {Cell, Column, CopyCellsMenuItem, IMenuContext, Table} from "@blueprintjs/table";

import {connect} from "../Connect";
import {getSelectedSections} from "../Helpers";
import {IAllReducers, SectionWithColor} from "../Interfaces";

interface ISelectedSectionsTableStateProps {
    selectedSections: SectionWithColor[];
}

@connect<ISelectedSectionsTableStateProps, {}, {}>(mapStateToProps)
export default class SelectedSectionsTable
    extends React.Component<ISelectedSectionsTableStateProps> {

    public render() {
        const numberOfSelectedSections = this.props.selectedSections.length;

        return numberOfSelectedSections === 0 ? null : (
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
}

function mapStateToProps(state: IAllReducers): ISelectedSectionsTableStateProps {
    return {
        selectedSections: getSelectedSections(state),
    };
}
