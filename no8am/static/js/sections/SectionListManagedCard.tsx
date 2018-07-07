import * as React from "react";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";

import {Classes} from "@blueprintjs/core";

import {goToManagedCard} from "./SectionActions";

const defaultStyle = {
    marginBottom: "20px",
    maxHeight: "100px",
    opacity: 1,
};

interface ISectionListManagedCard {
    managedAbbreviation: string;
}

interface ISectionListManagedCardDispatchProps {
    onClickManagedCard?: () => void;
}

class SectionListManagedCard extends React.Component<ISectionListManagedCard & ISectionListManagedCardDispatchProps> {

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

const SectionListManagedCardConnected = connect(
    () => ({}),
    (dispatch, props: ISectionListManagedCard): ISectionListManagedCardDispatchProps => bindActionCreators({
    onClickManagedCard: () => goToManagedCard(props.managedAbbreviation),
    }, dispatch),
)(SectionListManagedCard);

export default SectionListManagedCardConnected;
