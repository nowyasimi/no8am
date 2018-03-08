import * as React from "react";
import {bindActionCreators, Dispatch} from "redux";

import MediaQuery from "react-responsive";

import {connect} from "../Connect";
import {IAllReducers} from "../Interfaces";
import {ILoadSectionsThunk, loadSections} from "../sections/SectionActions";

import Calendar from "../calendar/Calendar";
import LeftSide from "./LeftSide";

interface IMainDispatchProps {
    onLoadSections: () => ILoadSectionsThunk;
}

@connect<{}, IMainDispatchProps, {}>(mapStateToProps, mapDispatchToProps)
export class Main extends React.Component<IMainDispatchProps, undefined> {

    private mobileCalendarStyle = {
        height: "100%",
        paddingTop: "1%",
    };

    private defaultCalendarStyle = {
        ...this.mobileCalendarStyle,
        left: "50%",
        position: "fixed",
    };

    public componentDidMount() {
        this.props.onLoadSections();
    }

    public render() {
        return (
            <div>
                <LeftSide />
                <MediaQuery minWidth={900}>
                    <Calendar style={this.defaultCalendarStyle} />
                </MediaQuery>
                <MediaQuery maxWidth={900}>
                    <Calendar style={this.mobileCalendarStyle} />
                </MediaQuery>
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
