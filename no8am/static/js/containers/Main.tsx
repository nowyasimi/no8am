import * as React from "react";
import {connect} from "react-redux";
import {bindActionCreators, Dispatch} from "redux";

import MediaQuery from "react-responsive";

import {IAllReducers} from "../Interfaces";
import {loadSections} from "../sections/SectionActions";

import Calendar from "../calendar/Calendar";
import Middle from "./Middle";
import Search from "./Search";

interface IMainDispatchProps {
    onLoadSections: () => void;
}

class Main extends React.Component<IMainDispatchProps> {

    private mobileContainerStyle: React.CSSProperties = {
        display: "flex",
        flexWrap: "wrap",
    };

    private defaultContainerStyle: React.CSSProperties = {
        ...this.mobileContainerStyle,
        flexWrap: "nowrap",
    };

    private mobileSearchStyle: React.CSSProperties = {
        width: "100%",
    };

    private defaultSearchStyle: React.CSSProperties = {
        position: "fixed",
        width: "250px",
    };

    private mobileCalendarStyle: React.CSSProperties = {
        height: "100vh",
        paddingTop: "1%",
        width: "100%",
    };

    private defaultCalendarStyle: React.CSSProperties = {
        ...this.mobileCalendarStyle,
        flexBasis: "400px",
        right: "10px",
        width: "inherit",
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
        position: "fixed",
        width: "400px",
    };

    private mobileMiddleStyle: React.CSSProperties = {
        width: "100%",
    };

    private defaultMiddleStyle: React.CSSProperties = {
        flexBasis: "40%",
        flexGrow: 1,
        paddingRight: "12px",
        width: "inherit",
    };

    public componentDidMount() {
        this.props.onLoadSections();
    }

    public render() {
        return (
            <div>
                <MediaQuery minWidth={900}>
                    <div style={this.defaultContainerStyle}>
                        <Search style={this.defaultSearchStyle} />
                        <Middle style={this.defaultMiddleStyle} />
                        <Calendar
                            style={this.defaultCalendarStyle}
                            innerCalendarStyle={this.defaultInnerCalendarStyle}
                        />
                    </div>
                </MediaQuery>
                <MediaQuery maxWidth={900}>
                    <div style={this.mobileContainerStyle}>
                        <Search style={this.mobileSearchStyle} />
                        <Middle style={this.mobileMiddleStyle} />
                        <Calendar
                            style={this.mobileCalendarStyle}
                            innerCalendarStyle={this.mobileInnerCalendarStyle}
                        />
                    </div>
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
