let React = require('react');
let Handlebars = require('handlebars');
let typeahead = require("typeahead.js-browserify");
typeahead.loadjQueryPlugin();
let Bloodhound = require("typeahead.js-browserify").Bloodhound;
import {TYPEAHEAD_OPTIONS} from '../Constants'
import {findDOMNode} from 'react-dom'
import { connect } from 'react-redux'

import {fetchNewCourse} from "../actions/sectionActions"

export class SearchBox extends React.Component{

    initializeTypeahead() {
        let typeaheadConfiguration = [];

        // create typeahead objects for each lookup type (CCC, credit, department, course)
        for (let type in TYPEAHEAD_OPTIONS) {
            let houndParams = {
                limit: 999,
                datumTokenizer: Bloodhound.tokenizers.obj.whitespace.apply(this, TYPEAHEAD_OPTIONS[type].token),
                queryTokenizer: Bloodhound.tokenizers.whitespace,
                local: metadata[type].map(function(x) {
                    x['category'] = type;
                    return x;
                })
            };

            if (type === "course") {
                houndParams.sorter = function(a, b) {

                    //get input text
                    let InputString = $("#typeaheadInput").typeahead("val").toLowerCase();

                    let inputLen = InputString.length;

                    // get shortened courseNum, look at first len(InputString) letters
                    let shortA = a.courseNum.substring(0,inputLen).toLowerCase();
                    let shortB = b.courseNum.substring(0,inputLen).toLowerCase();

                    // case 1: a and b are in same dept:
                    // compare the letter ordering (eg MATH 120 vs MATH 200)
                    if (InputString === shortA && InputString === shortB) {
                        return a.courseNum.localeCompare(b.courseNum);
                    }
                    // case 2: a is in dept, b isn't:
                    else if (InputString === shortA && InputString !== shortB) {
                        return -1;
                    }
                    // case 3: a isn't in dept, b is:
                    else if (InputString !== shortA && InputString === shortB) {
                        return 1;
                    }
                    // case 3: neither are in depts
                    // compare the letter ordering (eg CSCI 200 vs ENGR 340)
                    else {
                        return a.courseNum.localeCompare(b.courseNum);
                    }

                };
            }

            let hound = new Bloodhound(houndParams);

            hound.initialize();

            typeaheadConfiguration.push({
                limit: 999,
                name: type,
                displayKey: TYPEAHEAD_OPTIONS[type].token,
                source: hound.ttAdapter(),
                templates: {
                    header: TYPEAHEAD_OPTIONS[type].header,
                    suggestion: Handlebars.compile(TYPEAHEAD_OPTIONS[type].suggestion)
                }
            });
        }

        let element = findDOMNode(this);

        // initialize typeahead
        $(element).typeahead({highlight: true}, typeaheadConfiguration);

        $(element).on('typeahead:selected', (_, datum) => {
            // clear input from typeahead
            $(element).typeahead('val', "");

            // lookup department
            // if (datum.category === "department") {
            //     let dept = datum["abbreviation"];
            //     submitDeptRequest(dept);
            // }
            // // lookup CCC requirement
            // else if (datum.category === "ccc") {
            //     let ccc = datum["abbreviation"];
            //     submitOtherRequest('ccc', ccc, datum["name"]);
            // }
            // // lookup by credit
            // else if (datum.category === "credit") {
            //     let cred = datum["abbreviation"];
            //     submitOtherRequest('credit', cred, datum["name"]);
            // }
            // lookup course number
            // else {
                let courseNum = datum["courseNum"];
                let currentCourse = courseNum.split(' ');
                this.props.onAddNewCourse(currentCourse[0], currentCourse[1]);
            // }
        });
    }

    componentDidMount() {
        if (global.metadata == undefined) {
            $.getJSON(METADATA_URL, (metadata) => {
                global.metadata = metadata;
                this.initializeTypeahead()
            });
        }
        else {
            this.initializeTypeahead()
        }
    }

    componentWillUnmount(){
        var element = findDOMNode(this);
        $(element).typeahead('destroy');
    }

    render() {
        return (
            <input id="typeaheadInput" className="typeahead" type="text" placeholder="Course Number, Department, CCC, or Credits" />
        );
    }
}

export const ConnectedSearchBox = connect(() => {return {}}, {onAddNewCourse: fetchNewCourse})(SearchBox);