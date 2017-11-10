import * as React from "react";
import {connect} from "react-redux";

import {loadSections} from "../actions/sectionActions";

import LeftSide from "./LeftSide";
import Calendar from "./Calendar";

interface IMainProps {
    onLoadSections?: () => Promise<void>;
}

/* tslint:disable:no-empty */
@(connect(() => {}, mapDispatchToProps) as any)
export class Main extends React.Component<IMainProps, undefined> {

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

function mapDispatchToProps(dispatch) {
    return {
        onLoadSections: () => dispatch(loadSections()),
    };
}
