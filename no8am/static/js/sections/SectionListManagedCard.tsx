import * as React from "react";
import {bindActionCreators, Dispatch} from "redux";

import {connect} from "../Connect";

import {IAllReducers} from "../Interfaces";
import {goToManagedCard, returnOfGoToManagedCard} from "./SectionActions";

const defaultStyle = {
    maxHeight: "100px",
    opacity: 1,
};

interface ISectionListManagedCard {
    managedAbbreviation: string;
}

interface ISectionListManagedCardDispatchProps {
    onClickManagedCard?: () => typeof returnOfClickManagedCard;
}

@connect<{}, ISectionListManagedCardDispatchProps, ISectionListManagedCard>(() => {}, mapDispatchToProps)
export default class SectionListManagedCard
    extends React.Component<ISectionListManagedCard & ISectionListManagedCardDispatchProps> {

    public render() {

        return (
            <div>
                <div
                    className={`pt-card pt-interactive sectionCard lastOfType`}
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
