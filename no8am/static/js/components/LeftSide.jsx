let React = require('react');

import {CourseButtons} from './CourseButtons.jsx'
import {SearchBox} from './SearchBox.jsx'

export class LeftSide extends React.Component {
    render() {
        return (
            <div className="col-sm-6 page2bg" id="filters">
                <div>
                    <br />
                    <div className="btn-group btn-group-lg btn-group-justified viewToggleButtonContainer" data-toggle="buttons">
                        <label className="btn btn-default" id="viewSelectionsButton">
                            <input type="radio" name="options" /> View
                        </label>
                        <label className="btn btn-default active" id="editButton">
                            <input type="radio" name="options" defaultChecked /> Edit
                        </label>
                    </div>

                    <div id="remote" className="editRegion">
                        <SearchBox />
                    </div>

                    <div id="welcomeWell" className="well editRegion">
                        <h3> Welcome to no8am!</h3>
                        <span>
                          You can now lookup courses by <a href="javascript:setSearchBox('W1');">CCC Requirement</a>, <a href="javascript:setSearchBox('CSCI');">Department</a>, or <a href="javascript:setSearchBox('Half Credit');">Number of Credits</a>!
                        </span>
                        <br /> <br />
                            <a className="openModalButton" href="javascript:">Open From Browser</a>
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

                    <CourseButtons {...this.props} />

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
