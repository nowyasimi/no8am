let React = require('react');

import {connect} from 'react-redux'

import {Button, Menu, MenuItem, Position, Popover} from '@blueprintjs/core'

import CourseButtons from './CourseButtons.jsx'
import SearchOmnibox from './SearchOmnibox.jsx'
import SectionList from './SectionList.jsx'

import {openSearchOmnibox, clickDoneSelecting} from '../actions/sectionActions'
import {DATA_LOADING_STATE} from '../Constants'


@connect(mapStateToProps, mapDispatchToProps)
export default class LeftSide extends React.Component {

    render() {

        let mainContent = null;

        switch (this.props.currentSearch.state) {
            case DATA_LOADING_STATE.NO_SELECTION:
                mainContent = (
                    <div className="pt-non-ideal-state" id="startMessage">
                        <h4 className="pt-non-ideal-state-title">Welcome to No8am!</h4>
                        <div className="pt-non-ideal-state-description">
                            Use the search button to start or press
                            <span className="pt-key-combo searchOmniboxKeyCombo">
                                <kbd className="pt-key pt-modifier-key">
                                    <span className="pt-icon-standard pt-icon-key-command" />
                                    cmd
                                </kbd>
                                <kbd className="pt-key">K</kbd>
                            </span>
                        </div>
                    </div>
                );
                break;
            case DATA_LOADING_STATE.LOADING:
                mainContent = (
                    <div>
                        {`Loading data for ${this.props.currentSearch.item.userFriendlyFormat}`}
                    </div>
                );
                break;
            case DATA_LOADING_STATE.LOADED:
                mainContent = <SectionList {...this.props.currentSearch} />;
        }


        return (
            <div className="col-sm-6" id="filters">
                <SearchOmnibox/>

                <div className="pt-button-group pt-fill pt-large">
                    <Button iconName="folder-open" text="Open" />
                    <Button iconName="floppy-disk" text="Review/Save" />
                    <Button iconName="search" text="Search" onClick={this.props.onOpenSearchOmnibox} />
                    <Popover content={<Menu>
                                        <MenuItem
                                            iconName="pt-icon-confirm"
                                            text="Done selecting sections"
                                            onClick={this.props.onClickDoneSelecting}
                                        />
                                        <MenuItem
                                            iconName="pt-icon-cross"
                                            text="Remove selections"
                                        />
                                     </Menu>}
                             position={Position.BOTTOM}>
                        <Button iconName="cog" text="Course Options" rightIconName="caret-down"
                                disabled={this.props.currentSearch.state == DATA_LOADING_STATE.NO_SELECTION} />
                    </Popover>
                </div>

                {mainContent}
            </div>
        );
    }
}


function mapStateToProps(state) {
    return {
        currentSearch: state.currentSearch
    }
}


function mapDispatchToProps(dispatch) {
    return {
        onOpenSearchOmnibox: () => dispatch(openSearchOmnibox()),
        onClickDoneSelecting: () => dispatch(clickDoneSelecting())
    }
}
