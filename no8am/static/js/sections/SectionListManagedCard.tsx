import * as React from "react";
import {bindActionCreators, Dispatch} from "redux";

import {Classes} from "@blueprintjs/core";

import {connect} from "../Connect";

import {IAllReducers} from "../Interfaces";
import {goToManagedCard, returnOfGoToManagedCard} from "./SectionActions";

const defaultStyle = {
    marginBottom: "20px",
    maxHeight: "100px",
    opacity: 1,
};

interface ISectionListManagedCard {
    managedAbbreviation: string;
}

interface ISectionListManagedCardDispatchProps {
    onClickManagedCard?: () => typeof returnOfGoToManagedCard;
}

@connect<{}, ISectionListManagedCardDispatchProps, ISectionListManagedCard>(() => {}, mapDispatchToProps)
export default class SectionListManagedCard
    extends React.Component<ISectionListManagedCard & ISectionListManagedCardDispatchProps> {

    public render() {

        return (
            <div
                className={`${Classes.CARD} ${Classes.INTERACTIVE} sectionCard`}
                style={defaultStyle}
            >
                <ul
                    className={`sectionCardItemContainer`}
                    onClick={this.props.onClickManagedCard}
                >
                    <li className="sectionCardItem">
                        Go to {this.props.managedAbbreviation}
                    </li>
                </ul>
            </div>
        );
    }
}

function mapDispatchToProps(dispatch: Dispatch<IAllReducers>,
                            props: ISectionListManagedCard): ISectionListManagedCardDispatchProps {
    return bindActionCreators({
        onClickManagedCard: () => goToManagedCard(props.managedAbbreviation),
    }, dispatch);
}
