import * as React from "react";
import {connect} from "react-redux";
import {bindActionCreators, Dispatch} from "redux";

import MediaQuery from "react-responsive";

import {IAllReducers} from "../Interfaces";
import {loadSections} from "../sections/SectionActions";

import Calendar from "../calendar/Calendar";
import LeftSide from "./LeftSide";

interface IMainDispatchProps {
    onLoadSections: () => void;
}

class Main extends React.Component<IMainDispatchProps> {

    private mobileCalendarStyle: React.CSSProperties = {
        height: "100%",
        paddingTop: "1%",
    };

    private defaultCalendarStyle: React.CSSProperties = {
        ...this.mobileCalendarStyle,
        position: "fixed",
        right: "10px",
    };

    private innerCalendarDisableTextSelection: React.CSSProperties = {
        MozUserSelect: "none",
        WebkitTouchCallout: "none",
        WebkitUserSelect: "none",
        msUserSelect: "none",
        userSelect: "none",
    };

    private mobileInnerCalendarStyle: React.CSSProperties = {
        ...this.innerCalendarDisableTextSelection,
        height: "99%",
        margin: "0 auto",
        textAlign: "center",
        width: "100%",
    };

    private defaultInnerCalendarStyle: React.CSSProperties = {
        ...this.mobileInnerCalendarStyle,
        width: "400px",
    };

    private mobileLeftSideStyle: React.CSSProperties = {};

    private defaultLeftSideStyle: React.CSSProperties = {
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
                    <Calendar
                        style={this.defaultCalendarStyle}
                        innerCalendarStyle={this.defaultInnerCalendarStyle}
                    />
                </MediaQuery>
                <MediaQuery maxWidth={900}>
                    <LeftSide style={this.mobileLeftSideStyle} />
                    <Calendar
                        style={this.mobileCalendarStyle}
                        innerCalendarStyle={this.mobileInnerCalendarStyle}
                    />
                </MediaQuery>
            </div>
        );
    }

}

const MainConnected = connect(
    () => ({}),
    (dispatch: Dispatch<IAllReducers>): IMainDispatchProps => bindActionCreators({
        onLoadSections: loadSections,
    }, dispatch),
)(Main);

export default MainConnected;
