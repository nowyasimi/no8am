import * as React from "react";

import {bindActionCreators, Dispatch} from "redux";

import {connect} from "../Connect";

import {Classes} from "@blueprintjs/core";
import * as classNames from "classnames";
import {SearchItemType} from "../Constants";
import {IAllReducers, ISearchItemWithAllAbbreviations} from "../Interfaces";
import {clickCourseCard, returnOfClickCourseCard} from "../sections/SectionActions";

const cardStyle = {
    flex: "1 1 200px",
    margin: "10px",
};

interface ICourseCard {
    searchItem: ISearchItemWithAllAbbreviations;
}

interface ICourseCardDispatchProps {
    onClickCourseCard: () => typeof returnOfClickCourseCard;
}

@connect<{}, ICourseCardDispatchProps, ICourseCard>(null, mapDispatchToProps)
export class CourseCard extends React.Component<ICourseCard & ICourseCardDispatchProps> {

    public render() {
        const classes = classNames(
            Classes.CARD,
            Classes.INTERACTIVE,
            {
                selectedSection: this.props.searchItem.isSelected,
            },
        );

        return (
            <div
                className={classes}
                style={cardStyle}
                onClick={this.props.onClickCourseCard}
            >
                <h5>{this.formatTitle()}</h5>
                <p>{this.formatAbbreviations()}</p>
            </div>
        );
    }

    private formatTitle() {
        if (this.props.searchItem.currentItemCourseAbbreviation !== null &&
            this.props.searchItem.originItemAbbreviation === null) {
            return this.props.searchItem.currentItemCourseAbbreviation;
        } else if (this.props.searchItem.currentItemCourseAbbreviation !== null &&
            this.props.searchItem.originItemAbbreviation !== null) {
            return this.props.searchItem.currentItemCourseAbbreviation
            + ` (from ${this.props.searchItem.originItemAbbreviation})`;
        } else {
            return this.props.searchItem.originItemAbbreviation;
        }
    }

    private formatAbbreviations() {
        return this.props.searchItem.searchItemType === SearchItemType.Course ?
            this.props.searchItem.currentItemAllAbbreviations
                .map((abbreviation) => <span key={abbreviation}>{abbreviation} <br /></span>) :
            [];
    }
}

function mapDispatchToProps(dispatch: Dispatch<IAllReducers>, ownProps: ICourseCard): ICourseCardDispatchProps {
    return bindActionCreators({
        onClickCourseCard: () => clickCourseCard(ownProps.searchItem),
    }, dispatch);
}
