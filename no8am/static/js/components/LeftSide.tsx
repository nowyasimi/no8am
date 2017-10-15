import * as React from 'react'

import {connect} from 'react-redux'

import {Button, Menu, MenuItem, NonIdealState, Position, Popover, Spinner} from '@blueprintjs/core'

import CourseCards from './CourseCards'
import OpenDialog from './OpenDialog'
import SaveDialog from './SaveDialog'
import SearchOmnibox from './SearchOmnibox'
import SectionList from './SectionList'

import {openSearchOmnibox, clickDoneSelecting, clickAdvancedSectionSelection} from '../actions/sectionActions'
import {DATA_LOADING_STATE} from '../Constants'

interface LeftSideProps {
    currentSearch?: any,
    onOpenSearchOmnibox?: () => Promise<void>,
    onClickDoneSelecting?: () => Promise<void>,
    onClickAdvancedSectionSelection?: () => Promise<void>
}

@(connect(mapStateToProps, mapDispatchToProps) as any)
export default class LeftSide extends React.Component<LeftSideProps, undefined>  {

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
                break;
        }

        let isNoCurrentSearch = this.props.currentSearch.state == DATA_LOADING_STATE.NO_SELECTION;

        return (
            <div className="col-sm-6" id="filters">
                <SearchOmnibox/>

                <div className="pt-button-group pt-fill pt-large">
                    <OpenDialog />
                    <SaveDialog />
                    <Button iconName="search" text="Search" onClick={this.props.onOpenSearchOmnibox} />
                </div>

                <CourseCards />

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
        onClickDoneSelecting: () => dispatch(clickDoneSelecting()),
        onClickAdvancedSectionSelection: () => dispatch(clickAdvancedSectionSelection())
    }
}
