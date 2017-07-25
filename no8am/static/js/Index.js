import "babel-polyfill";


import $ from 'jquery'
global.$ = global.jQuery = $;

console.log($);

let React = require('react');
let ReactDOM = require('react-dom');

require('bootstrap');

import {
    generateAndStoreJSON, removeFromStorage, newScheduleFromConfig,
    initializeTypeahead, generateCustomLink, handleNewInput, removeCourseButtonHandler,
    initializeHandlebarsTemplates, revertToCourseGroupButtonHandler, viewSectionListButtonHandler,
    sendReport, viewSelectionsButtonHandler, editButtonHandler,
    clearReportErrorModal,
    openSaveModalButtonHandler, retryButtonHandler, findCourseConfigurations, justDoIt,
    addCoursesInSavedSchedule
} from './base';

import { createStore, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import { Provider } from 'react-redux'

import { sectionReducer } from "./reducers/sectionReducer"


import {Main} from './components/Main.jsx';

function createCalendar() {
    const store = createStore(
        sectionReducer,
        window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
        applyMiddleware(thunkMiddleware) // lets us dispatch() functions
    );

    ReactDOM.render(
        <Provider store={store}>
            <Main/>
        </Provider>,
        document.getElementById('mainReactContainer')
    );
}

// called when page is fully loaded
$(function() {

    createCalendar();

    // initializeHandlebarsTemplates();

    // $.getJSON(METADATA_URL, function(metadata) {
    //    initializeTypeahead(metadata)
    // });

    // add courses if saved schedule from custom link if schedule exists
    // if (!$.isEmptyObject(savedSchedule)) {
    //     $("#welcomeWell").slideUp();
    //     addCoursesInSavedSchedule(savedSchedule);
    // }


    // $(document)
        // .on("click", ".removeCourse", removeCourseButtonHandler)
        // .on("click", ".course-revert", revertToCourseGroupButtonHandler)
        // .on('click', '.toggle', viewSectionListButtonHandler)
        // .on("click", "#listViewData tbody tr", courseTableSectionClickHandler)
        // .on("click", "#selectSection", function() { $("#courseTable").modal('hide'); })
        // .on('shown.bs.modal', '#courseTable', updateCourseTableBackdrop)
        // .on('hidden.bs.modal', "#courseTable", sectionSelectionHandler)
        // .on("click", ".selectCourseConfig", newScheduleFromConfig)
        // .on("click", ".removeCourseConfig", removeFromStorage)
        // .on("click", ".openModalButton", function(){ findCourseConfigurations(); $("#openModal").modal();})
        // .on("click", "#saveSchedule", generateAndStoreJSON)
        // .on("click", "#openSaveDialog", openSaveModalButtonHandler)
        // .on("click", "#openReportDialog", function() { $("#reportErrorModal").modal(); })
        // .on("click", "#sendReport", sendReport)
        // .on('hidden.bs.modal', "#reportErrorModal", clearReportErrorModal)
        // .on("click", "#openGenerateLinkModal", generateCustomLink)
        // .on("click", "#viewSelectionsButton", viewSelectionsButtonHandler)
        // .on("click", "#editButton", editButtonHandler)
        // .on("click", ".retryButton", retryButtonHandler)
        // .on("input", ".typeahead", justDoIt)
        // .on('typeahead:selected', ".typeahead", handleNewInput);
});