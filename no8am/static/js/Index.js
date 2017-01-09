$ = require('jquery');

require('bootstrap');

import {
    generateAndStoreJSON, removeFromStorage, sectionSelectionHandler, newScheduleFromConfig,
    initializeTypeahead, generateCustomLink, handleNewInput, removeCourseButtonHandler,
    initializeHandlebarsTemplates, revertToCourseGroupButtonHandler, viewSectionListButtonHandler,
    viewSectionListFromCalendarHandler, sendReport, viewSelectionsButtonHandler, editButtonHandler,
    clearReportErrorModal, calendarSectionHoverHandler, courseTableSectionHoverHandler, courseTableSectionClickHandler,
    openSaveModalButtonHandler, retryButtonHandler, updateCourseTableBackdrop, findCourseConfigurations, justDoIt,
    addCoursesInSavedSchedule
} from './base';

import {Schedule} from './Schedule';


// global schedule object
export let sched = new Schedule();
global.sched = sched;

// called when page is fully loaded
$(function() {

    initializeHandlebarsTemplates();

    $.getJSON(METADATA_URL, function(metadata) {
       initializeTypeahead(metadata)
    });

    console.log(savedSchedule);

    // add courses if saved schedule from custom link if schedule exists
    if (!$.isEmptyObject(savedSchedule)) {
        $("#welcomeWell").slideUp();
        addCoursesInSavedSchedule(savedSchedule);
    }


    $(document)
        .on("click", ".removeCourse", removeCourseButtonHandler)
        .on("click", ".course-revert", revertToCourseGroupButtonHandler)
        .on('click', '.toggle', viewSectionListButtonHandler)
        .on('click', '.open li', viewSectionListFromCalendarHandler)
        .on("mouseenter mouseleave", ".open li", calendarSectionHoverHandler)
        .on("mouseenter mouseleave", "#courseTable tr", courseTableSectionHoverHandler)
        .on("click", "#listViewData tbody tr", courseTableSectionClickHandler)
        .on("click", "#selectSection", function() { $("#courseTable").modal('hide'); })
        .on('shown.bs.modal', '#courseTable', updateCourseTableBackdrop)
        .on('hidden.bs.modal', "#courseTable", sectionSelectionHandler)
        .on("click", ".selectCourseConfig", newScheduleFromConfig)
        .on("click", ".removeCourseConfig", removeFromStorage)
        .on("click", ".openModalButton", function(){ findCourseConfigurations(); $("#openModal").modal();})
        .on("click", "#saveSchedule", generateAndStoreJSON)
        .on("click", "#openSaveDialog", openSaveModalButtonHandler)
        .on("click", "#openReportDialog", function() { $("#reportErrorModal").modal(); })
        .on("click", "#sendReport", sendReport)
        .on('hidden.bs.modal', "#reportErrorModal", clearReportErrorModal)
        .on("click", "#openGenerateLinkModal", generateCustomLink)
        .on("click", "#viewSelectionsButton", viewSelectionsButtonHandler)
        .on("click", "#editButton", editButtonHandler)
        .on("click", ".retryButton", retryButtonHandler)
        .on("input", ".typeahead", justDoIt)
        .on('typeahead:selected', ".typeahead", handleNewInput);
});
