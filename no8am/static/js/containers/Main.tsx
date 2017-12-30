import * as React from "react";
import {bindActionCreators, Dispatch} from "redux";

import {connect} from "../Connect";
import {IAllReducers, IMetadata} from "../Interfaces";
import {ILoadSectionsThunk, loadSections} from "../sections/SectionActions";

import Calendar from "../calendar/Calendar";
import LeftSide from "./LeftSide";

interface IMainDispatchProps {
    onLoadSections: () => ILoadSectionsThunk;
}

@connect<{}, IMainDispatchProps, {}>(mapStateToProps, mapDispatchToProps)
export class Main extends React.Component<IMainDispatchProps, undefined> {

    public componentDidMount() {
        this.props.onLoadSections();
    }

    public render() {
        return (
            <div>
                <LeftSide />
                <Calendar />
            </div>
        );
    }

}

function mapStateToProps(state: IAllReducers) {
    return {};
}

function mapDispatchToProps(dispatch: Dispatch<IAllReducers>): IMainDispatchProps {
    return bindActionCreators({
        onLoadSections: loadSections,
    }, dispatch);
}
