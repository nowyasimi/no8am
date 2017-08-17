let React = require('react');

import {connect} from 'react-redux'

import SearchBox from './SearchBox.jsx'
import CourseButtons from './CourseButtons.jsx'
import SearchOmnibox from './SearchOmnibox.jsx'
import {openSearchOmnibox} from '../actions/sectionActions'


@connect(() => {return {}}, mapDispatchToProps)
export default class LeftSide extends React.Component {
    render() {
        return (
            <div className="col-sm-6" id="filters">
                <SearchOmnibox/>

                <div>

                    <div className="pt-button-group pt-fill pt-large">
                        <a className="pt-button pt-icon-folder-open" tabIndex="0" role="button">Open</a>
                        <a className="pt-button pt-icon-floppy-disk" tabIndex="0" role="button">Review/Save</a>
                        <a className="pt-button pt-icon-search" onClick={() => this.props.onOpenSearchOmnibox()} tabIndex="0" role="button">Search</a>
                        <a className="pt-button pt-icon-floppy-disk pt-disabled" tabIndex="0" role="button">Course Options</a>
                    </div>

                    <div className="pt-non-ideal-state" id="startMessage">
                        <div className="pt-non-ideal-state-visual pt-non-ideal-state-icon">
                            <span className="pt-icon pt-icon-info-sign"></span>
                        </div>
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

                    <div id="alertRegion">
                        <div className="alert alert-warning visible-xs" role="alert">
                            <button type="button" className="close" data-dismiss="alert" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                            <b>Heads up:</b> This interface works best on larger screens. To improve your experience, expand your browser
                            window or use another device.
                        </div>
                        <div className="alert alert-warning" id="hasOverlap" role="alert">

                        </div>
                    </div>

                    <CourseButtons />

                    <div className="row viewRegion" id="viewSelections">
                        <div className="row">
                            <div className="panel panel-default" id="crnlist">
                                <div className="panel-body">

                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="list-group" id="openSaveButtons">
                                    <a className="list-group-item openModalButton">
                                        <h4 className="list-group-item-heading">Open from Browser<span className="glyphicon glyphicon-folder-open pull-right"> </span></h4>
                                    </a>
                                    <a className="list-group-item" id="openSaveDialog">
                                        <h4 className="list-group-item-heading">Save to Browser<span className="glyphicon glyphicon-hdd pull-right"> </span></h4>
                                    </a>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="list-group">
                                    <a className="list-group-item" id="openGenerateLinkModal">
                                        <h4 className="list-group-item-heading">Generate Link<span className="glyphicon glyphicon-cloud pull-right"> </span></h4>
                                    </a>
                                    <a className="list-group-item" id="generatedLink">
                                        <span id="generatedLinkHolder"></span>
                                        <span className="glyphicon glyphicon-exclamation-sign pull-right"></span>

                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="under-courses">

                    </div>
                </div>
            </div>
        );
    }
}

// Map Redux actions to component props
function mapDispatchToProps(dispatch) {
    return {
        onOpenSearchOmnibox: () => dispatch(openSearchOmnibox()),
    }
}
