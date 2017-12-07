import * as React from "react";
import {connect} from "react-redux";
import {Dispatch} from "redux";

import {IMetadata} from "../Interfaces";
import {loadSections} from "../sections/SectionActions";

import Calendar from "../calendar/Calendar";
import LeftSide from "./LeftSide";

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

function mapDispatchToProps(dispatch: any) {
    return {
        onLoadSections: () => dispatch(loadSections()),
    };
}
