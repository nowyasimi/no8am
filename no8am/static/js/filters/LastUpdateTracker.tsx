import * as React from "react";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";

import { Button } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import TimeAgo from "react-timeago";
import buildFormatter from "react-timeago/lib/formatters/buildFormatter";
import englishStrings from "react-timeago/lib/language-strings/en";

import { DataLoadingState } from "../Constants";
import {IAllReducers} from "../Interfaces";
import { loadSections, setUpdateCheckAvailable } from "../sections/SectionActions";

const LastUpdateTrackerStyle: React.CSSProperties = {
    marginLeft: "5%",
    width: "75%",
};

interface ILastUpdateTrackerStateProps {
    expirationSeconds: number | null;
    lastUpdateSeconds: number | null;
    sectionDataStatus: DataLoadingState;
}

interface ILastUpdateTrackerDispatchProps {
    onLoadSections: () => void;
    onSetUpdateCheckAvailable: () => void;
}

class LastUpdateTracker extends React.Component<ILastUpdateTrackerStateProps & ILastUpdateTrackerDispatchProps> {
    private timer: NodeJS.Timer | null;

    public constructor(props: ILastUpdateTrackerStateProps & ILastUpdateTrackerDispatchProps) {
        super(props);
        this.timer = null;
    }

    public componentDidMount() {
        this.timer = setInterval(this.tick, 5000);
    }

    public componentWillUnmount() {
        if (this.timer !== null) {
            clearInterval(this.timer);
        }
    }

    public render() {
        const formatter = buildFormatter(englishStrings);
        const cacheTime = this.props.lastUpdateSeconds == null ?
            new Date() : new Date(this.props.lastUpdateSeconds * 1000);

        let nextUpdateTime = null;

        if (this.props.expirationSeconds !== null && this.props.lastUpdateSeconds != null) {
            nextUpdateTime = new Date((this.props.expirationSeconds + this.props.lastUpdateSeconds) * 1000);
        }

        let nextUpdate;

        if (nextUpdateTime === null) {
            nextUpdate = null;
        } else if (new Date() < nextUpdateTime) {
            nextUpdate = (
                <div>
                Next update available in <TimeAgo date={nextUpdateTime} formatter={formatter} />
                </div>
            );
        }

        return (
            <div style={LastUpdateTrackerStyle}>
                Last update from Bucknell was <TimeAgo date={cacheTime} formatter={formatter} />
                {nextUpdate}
                {this.renderUpdateAvailableButton()}
            </div>
        );
    }

    private renderUpdateAvailableButton() {
        if (this.props.sectionDataStatus === DataLoadingState.UPDATE_AVAILABLE) {
            return <Button icon={IconNames.REFRESH} text={"Update Course Data"} onClick={this.props.onLoadSections} />;
        } else {
            return null;
        }
    }

    private tick = () => {
        if (this.props.expirationSeconds === null
            || this.props.lastUpdateSeconds === null
            || this.props.sectionDataStatus !== DataLoadingState.LOADED) {
            return;
        }

        if (Math.round((new Date()).getTime() / 1000) > this.props.expirationSeconds + this.props.lastUpdateSeconds) {
            this.props.onSetUpdateCheckAvailable();
        }
    }
}

const LastUpdateTrackerConnected = connect(
    (state: IAllReducers): ILastUpdateTrackerStateProps => ({
        expirationSeconds: state.sections.expirationSeconds,
        lastUpdateSeconds: state.sections.lastUpdateSeconds,
        sectionDataStatus: state.sections.status,
    }),
    (dispatch): ILastUpdateTrackerDispatchProps => bindActionCreators({
        onLoadSections: loadSections,
        onSetUpdateCheckAvailable: setUpdateCheckAvailable,
    }, dispatch),
)(LastUpdateTracker);

export default LastUpdateTrackerConnected;
