let React = require('react');

import {connect} from 'react-redux'

import {Button, Menu, MenuItem, NonIdealState, Position, Popover, Spinner} from '@blueprintjs/core'

import OpenDialog from './OpenDialog.jsx'
import SaveDialog from './SaveDialog.jsx'
import SearchOmnibox from './SearchOmnibox.jsx'
import SectionList from './SectionList.jsx'


import {openSearchOmnibox, clickDoneSelecting, clickAdvancedSectionSelection} from '../actions/sectionActions'
import {DATA_LOADING_STATE} from '../Constants'


@connect(mapStateToProps, mapDispatchToProps)
export default class LeftSide extends React.Component {

    render() {

        let mainContent = null;

        switch (this.props.currentSearch.state) {
            case DATA_LOADING_STATE.NO_SELECTION:
                mainContent = (
                    <NonIdealState
                        className="nonIdealState"
                        title="Welcome to No8am!"
                        description={(
                            <div>Use the search button to start or press
                                <span className="pt-key-combo searchOmniboxKeyCombo">
                                    <kbd className="pt-key pt-modifier-key">
                                        <span className="pt-icon-standard pt-icon-key-command" />
                                        cmd
                                    </kbd>
                                    <kbd className="pt-key">K</kbd>
                                </span>
                            </div>)}
                    />
                );
                break;
            case DATA_LOADING_STATE.LOADING:
                mainContent = (
                    <NonIdealState
                        visual={<Spinner />}
                        className="nonIdealState"
                        description={`Loading data for ${this.props.currentSearch.item.userFriendlyFormat}`}
                    />
                );
                break;
            case DATA_LOADING_STATE.LOADED:
                mainContent = <SectionList {...this.props.currentSearch} />;
        }

        let isNoCurrentSearch = this.props.currentSearch.state == DATA_LOADING_STATE.NO_SELECTION;

        return (
            <div className="col-sm-6" id="filters">
                <SearchOmnibox/>

                <div className="pt-button-group pt-fill pt-large">
                    <OpenDialog />
                    <SaveDialog />
                    <Button iconName="search" text="Search" onClick={this.props.onOpenSearchOmnibox} />
                    <Popover content={<Menu>
                                        <MenuItem
                                            iconName={this.props.isAdvanced ? "pt-icon-tick" : "pt-icon-disable"}
                                            text="Advanced section selection"
                                            onClick={this.props.onClickAdvancedSectionSelection}
                                        />
                                        <MenuItem
                                            iconName="pt-icon-confirm"
                                            text="Done selecting sections"
                                            onClick={this.props.onClickDoneSelecting}
                                            disabled={isNoCurrentSearch}
                                        />
                                        <MenuItem
                                            iconName="pt-icon-remove"
                                            text="Remove current selections"
                                            disabled={isNoCurrentSearch}
                                        />
                                        <MenuItem
                                            iconName="pt-icon-delete"
                                            text="Remove all selections"
                                            disabled={isNoCurrentSearch}
                                        />
                                     </Menu>}
                             position={Position.BOTTOM}>
                        <Button iconName="cog" text="Course Options" rightIconName="caret-down" />
                    </Popover>
                </div>

                {mainContent}
            </div>
        );
    }
}


function mapStateToProps(state) {
    return {
        currentSearch: state.currentSearch,
        isAdvanced: state.isAdvanced
    }
}


function mapDispatchToProps(dispatch) {
    return {
        onOpenSearchOmnibox: () => dispatch(openSearchOmnibox()),
        onClickDoneSelecting: () => dispatch(clickDoneSelecting()),
        onClickAdvancedSectionSelection: () => dispatch(clickAdvancedSectionSelection())
    }
}
