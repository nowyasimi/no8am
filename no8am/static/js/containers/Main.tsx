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
        position: "fixed",
        right: "10px",
    };

    private innerCalendarDisableTextSelection = {
        KhtmlUserSelect: "none",
        MozUserSelect: "none",
        MsUserSelect: "none",
        WebkitTouchCallout: "none",
        WebkitUserSelect: "none",
        userSelect: "none",
    };

    private mobileInnerCalendarStyle = {
        ...this.innerCalendarDisableTextSelection,
        height: "99%",
        margin: "0 auto",
        position: "center",
        textAlign: "center",
        width: "100%",
    };

    private defaultInnerCalendarStyle = {
        ...this.mobileInnerCalendarStyle,
        width: "400px",
    };

    private mobileLeftSideStyle = {};

    private defaultLeftSideStyle = {
        float: "left",
        width: "calc(100% - 430px)",
    };

    public componentDidMount() {
        this.props.onLoadSections();
    }

    public render() {
        return (
            <div>
                <MediaQuery minWidth={900}>
                    <LeftSide style={this.defaultLeftSideStyle} />
                    <Calendar style={this.defaultCalendarStyle} innerCalendarStyle={this.defaultInnerCalendarStyle} />
                </MediaQuery>
                <MediaQuery maxWidth={900}>
                    <LeftSide style={this.mobileLeftSideStyle} />
                    <Calendar style={this.mobileCalendarStyle} innerCalendarStyle={this.mobileInnerCalendarStyle} />
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
