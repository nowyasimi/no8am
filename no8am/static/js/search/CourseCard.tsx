import * as React from "react";

import {MapDispatchToProps, MapStateToProps} from "react-redux";
import {bindActionCreators, Dispatch} from "redux";

import {connect} from "../Connect";

import {Classes} from "@blueprintjs/core";
import * as classNames from "classnames";
import {IAllReducers, ISearchItemWithAllAbbreviations, ISectionReducer} from "../Interfaces";
import {clickCourseCard, returnOfClickCourseCard, searchItem} from "../sections/SectionActions";
import { SearchItemType } from "../Constants";

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

    // {/* <div className="pt-card pt-interactive" style={cardStyle}>
    //             <h5><a href="#">Search</a></h5>
    //             <p></p>
    //         </div>
    //         <div className="pt-card pt-interactive" style={cardStyle}>
    //             <h5><a href="#">Desk Profile</a></h5>
    //             <p>Desk-level summary of trading activity and trading profiles.</p>
    //         </div>
    //         <div className="pt-card pt-interactive" style={cardStyle}>
    //             <h5><a href="#">Dataset Dashboards</a></h5>
    //             <p>Stats of dataset completeness and reference data join percentages.</p>
    //         </div> */}

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
                <h5>{this.props.searchItem.currentItemBaseAbbreviation}</h5>
                <p>{this.formatAbbreviations()}</p>
            </div>
        );
    }

    private formatAbbreviations() {
        return this.props.searchItem.searchItemType === SearchItemType.Course ?
            this.props.searchItem.currentItemAllAbbreviations
                .map((abbreviation) => <span key={abbreviation}>{abbreviation} <br /></span>) :
            [];
    }

    private handleClickCourseCard() {
        if (this.props.onClickCourseCard) {
            this.props.onClickCourseCard();
        } else {
            throw new Error("Course card click event handler should not be undefined");
        }
    }
}

function mapDispatchToProps(dispatch: Dispatch<IAllReducers>, ownProps: ICourseCard): ICourseCardDispatchProps {
    return bindActionCreators({
        onClickCourseCard: () => clickCourseCard(ownProps.searchItem),
    }, dispatch);
}
