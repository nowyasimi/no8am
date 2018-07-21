import * as React from "react";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";

import {Tag} from "@blueprintjs/core";

import {Section} from "../Interfaces";
import {goToManagedCard, removeSelectedSection} from "./SectionActions";

interface ISectionListGroupTagProps {
    section: Section;
}

interface ISectionListGroupTagDispatchProps {
    onClickGoToCourseCard: () => void;
    onClickRemoveSection: () => void;
}

class SectionListGroupTag extends React.Component<ISectionListGroupTagProps & ISectionListGroupTagDispatchProps> {

    public render() {
        return (
            <Tag
                key={this.props.section.departmentAndCourse}
                interactive={true}
                onClick={this.props.onClickGoToCourseCard}
                onRemove={this.onClickRemoveSectionWrapper}
            >
                {this.props.section.departmentAndCourse}
            </Tag>
        );
    }

    private onClickRemoveSectionWrapper = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        this.props.onClickRemoveSection();
    }
}

const SectionListGroupTagConnected = connect(
    null,
    (dispatch, ownProps: ISectionListGroupTagProps): ISectionListGroupTagDispatchProps => bindActionCreators({
        onClickGoToCourseCard: () => goToManagedCard(ownProps.section.departmentAndBareCourse),
        onClickRemoveSection: () => removeSelectedSection(ownProps.section),
    }, dispatch),
)(SectionListGroupTag);

export default SectionListGroupTagConnected;
