let Handlebars = require('handlebars');
let typeahead = require('../../../node_modules/typeahead.js/dist/typeahead.jquery.js');
let Bloodhound = require('../../../node_modules/typeahead.js/dist/bloodhound.js');

require('bootstrap');

import {
    colorDict, SECTION_TYPES, OTHER_LOOKUP_URL, DEPT_LOOKUP_URL, COURSE_LOOKUP_URL, STORE_CONFIG_URL,
    SUCCESSFUL_SAVE_MESSAGE, REPORT_SENT_MESSAGE, NEW_CUSTOM_LINK_WARNING, JUST_DO_IT, TYPEAHEAD_OPTIONS
} from './Constants';

import {Course, ExtraCourse} from './Course';
import {Schedule} from './Schedule';
import {Department} from './Department';

// handlebars templates
export let calendarElement, buttonGroup, extraSectionsButton, sectionList, sectionDetails, courseOverlap, savedSchedule,
    crnTable;

// for adding tooltip to custom link button
let showTooltip = false;

/**
 * Updates the number of courses available for selection in the GUI for a given course group.
 * @param courseGroupID The ID for the course group to be updated in the GUI
 * @param numCourses The number of courses that course group has
 */
export function setNumberOfCourses(courseGroupID, numCourses) {
    $("a[data-dept='" + courseGroupID + "'] .list-group-item-text .sectionCount").text(numCourses + " Courses");
}

/**
 * Updates the number of sections available for selection in the GUI for a given course.
 * @param courseID The ID for the course to be updated in the GUI
 * @param numSections The number of courses that course has
 */
export function setNumberOfSections(courseID, numSections) {
    $("a[data-course='"+ courseID +"'] .list-group-item-text .sectionCount").text(numSections + " Sections");
}

/**
 * Takes all information that displays color in the GUI and returns the
 * least frequently used color.
 * @return The least common color
 */
export function colorChooser(courseArray, departmentsArray, usedColors) {
    let counters = {};

    // Initialize color counter to 0's
    for (let color in colorDict) {
        counters[color] = 0;
    }

    // Iterate through courses
    for (let x in courseArray) {
        let current = courseArray[x];
        // make sure it's not an extra course
        if (current instanceof ExtraCourse) {
            continue;
        }
        // up the counters
        counters[current.mainColor]++;
        for (let extra in current.extra_sections) {
            if (current.extra_sections[extra] !== null)
                counters[current.extra_sections[extra]]++;
        }
    }

    // iterate through departments
    for (let x in departmentsArray) {
        // they currently only have one color, since only main sections are included
        let current_color = departmentsArray[x].color;
        // up the counter
        counters[current_color]++;
    }

    // iterate through colors currently being used
    for (let x in usedColors) {
        counters[usedColors[x]]++;
    }

    // find and return the least common color
    return Object.keys(counters).reduce(
        function(a, b) {
            return counters[a] <= counters[b] ? a : b
        }
    );
}

/**
 * Replaces introduction window with class hours counter and copyright information.
 */
export function removeIntroInfo() {
    $("#welcomeWell").slideUp().remove();

    $(".under-courses").slideDown();
}

/**
 * Custom sort to compare pairs of values in an array of time intervals. Values in the
 * array look like "1s", "5s", or "8e". The number corresponds to time and the
 * letter at the end denotes the start of an interval (s) or the end (e). A sorted array
 * prioritizes earlier times to later times and the end of an interval the the start of
 * an interval (to prevent classes that start immediately after another ends from being
 * flagged as overlapping).
 * @param a A time within a time interval
 * @param b A time within a time interval
 * @return {Boolean} True if a > b
 */
export function customSort(a, b) {
    const aFullInterval = a.time;
    const bFullInterval = b.time;
    const aTimeComponent = parseFloat(aFullInterval.substring(0, aFullInterval.length));
    const bTimeComponent = parseFloat(bFullInterval.substring(0, bFullInterval.length));

    let result;

    // Time components are equivalent so check if they're the start or end of the interval
    if (aTimeComponent == bTimeComponent) {
        result = aFullInterval.localeCompare(bFullInterval);
    }
    else {
        result = aTimeComponent - bTimeComponent;
    }

    return result;
}


/**
 * Get size of Object
 * @param obj An Object
 * @return {number} The size of the object
 */
Object.size = function(obj) {
    let size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};


/**
 * Generates an iterable array with increasing values.
 * @param start Starting value
 * @param count Number of values to return
 * @return {Array|*} An array that increases by 1 after each value
 */
function range(start, count) {
  return Array.apply(0, new Array(count))
      .map(function (element, index) {
          return index + start;
      });
}

/**
 * Generates the HTML string for a single course
 * @param courseNum The course number
 * @param data The selected section details (section number and CRN), if one was selected
 * @param letter A non-empty string if the course is an extra course
 * @return {string} An HTML string for the course
 */
function generateHTMLFromNullOrCrnAndSection(courseNum, data, letter) {
    var sectionDetailString = data === null ? "" : data[1] + " " + data[0];
    return courseNum + letter + " " + sectionDetailString + "<br>";
}

/**
 * Iterates through all saved course data and generates HTML for each course
 * @param courseData Object containing all course data
 * @return {string} An HTML string containing one saved course per line.
 */
function generateHTMLFromCourseData(courseData) {
    let htmlString = "";
    for (let courseNum in courseData) {
        for (let typeIndex in SECTION_TYPES) {
            let type = SECTION_TYPES[typeIndex];
            if (courseData[courseNum].hasOwnProperty(type)) {
                let data = courseData[courseNum][type];
                htmlString += generateHTMLFromNullOrCrnAndSection(courseNum, data, type == "main" ? "" : type);
            }
        }
    }
    return htmlString;
}

/**
 * Populate open schedule dialog with saved schedule configurations.
 * @param courseConfigs An object containing saved course configurations
 */
function displayCourseConfigurations(courseConfigs) {
    // TODO - make it more obvious that a schedule from a previous semester cannot be displayed
    let schedules = [];

    // generate HTML parameters for the schedules
    for (let configNum in courseConfigs) {
        let currentConfig = courseConfigs[configNum];

        schedules.push({
            configNum: configNum,
            currentConfig: currentConfig,
            courseData: generateHTMLFromCourseData(currentConfig.courseData)
        });
    }

    let courseConfigurationHTML = savedSchedule(schedules);

    // display the HTML
    $("#courseConfigs").html(courseConfigurationHTML);
}

/**
 * Retrieve all saved schedule configuration using Javascript Localstorage API.
 */
export function findCourseConfigurations() {
    let numItems = localStorage.length;
    let courseConfigs = {};

    // iterate through all values stored in localstorage
    for (let x in range(0, numItems)) {
        let itemName = localStorage.key(x);
        // found a saved schedule
        if (itemName.length > 16 && itemName.slice(0,16) === "courseConfigData") {
            let configID = itemName.substring(16);
            let configData = localStorage.getItem(itemName);
            courseConfigs[configID] = JSON.parse(configData);
        }
    }

    // display saved schedules in GUI
    displayCourseConfigurations(courseConfigs);
}

/**
 * Creates a JavaScript object containing courses (both selected and unselected) currently in the schedule. Used
 * to save schedules to localstorage and for generating custom links.
 * @return {{}} Object containing user's courses
 */
function generateCourseDataToStore() {
    // Generated course information object
    let courseData = {};

    // iterate through all courses
    for (let x in sched.course) {
        let currentCourse = sched.course[x];
        let currentCourseNum = currentCourse.courseNum;
        let tempCourseObj = {};
        if (currentCourse instanceof Course) {

            // add main section to saved schedule, along with selected section if it exists
            let tempMain = sched.getSelectedSectionForCourse(x);
            tempCourseObj["main"] = tempMain === null ? null : [tempMain.CRN, tempMain.sectionNum];

            // do the same for extra sections
            for (let extra in currentCourse.extra_sections) {
                if (sched.selected.hasOwnProperty(x + extra) && sched.selected[x + extra] !== null) {
                    let tempExtra= sched.course[x + extra].sections[sched.selected[x + extra]];
                    tempCourseObj[extra] = [tempExtra.CRN, tempExtra.sectionNum];
                }
                else {
                    tempCourseObj[extra] = null;
                }
            }
            courseData[currentCourseNum] = tempCourseObj;
        }
    }

    return courseData;
}

/**
 * Save current schedule to localStorage with a description, if provided.
 */
export function generateAndStoreJSON() {
    let $courseConfigDescription = $("#courseConfigDescription");

    let description = $courseConfigDescription.val();
    $courseConfigDescription.val("");

    // Replace characters unfriendly with JSON
    description.replace(/"/g, "'");

    // Set counter if it doesn't exist
    if (localStorage.getItem("courseConfigCounter") === null) {
        localStorage.setItem("courseConfigCounter", "0");
    }

    // Increment counter
    let courseConfigCounter = localStorage.getItem("courseConfigCounter");
    localStorage.setItem("courseConfigCounter", ++courseConfigCounter);

    // Create object to be stored and add relevant information
    let data = {};
    data.customName = description;
    data.courseData = generateCourseDataToStore();
    data.semester = CURRENT_SEMESTER;

    // Put it into storage
    localStorage.setItem("courseConfigData" + courseConfigCounter, JSON.stringify(data));

    $("#alertRegion").append(SUCCESSFUL_SAVE_MESSAGE);
    $("#saveModal").modal('hide');
}

/**
 * Remove saved schedule from localstorage and generate new list of course configurations.
 */
export function removeFromStorage() {
    let selectedConfig = $(this).attr("id").substring(12);
    localStorage.removeItem("courseConfigData" + selectedConfig);
    findCourseConfigurations();
}

/**
 * Called from GUI to set search box to sample values.
 * @param value An example value for the search box.
 */
function setSearchBox(value) {
    $(".typeahead").typeahead('val', '');
    $(".typeahead").focus().typeahead('val', value);
}

/**
 * Submits new course request for all sections of a course.
 *
 * @param department The department for the course (eg CSCI)
 * @param course The course number (eg 203)
 * @param section An optional specific section (eg 01)
 */
function addNewCourse(department, course, section) {
    let newCourse = new Course(department + " " + course);
    let courseLength = sched.pushData(newCourse);

    submitCourseRequest(courseLength, department, course, section);

    ga('send', {
        hitType: 'event',
        eventCategory: 'course',
        eventAction: 'add',
        eventLabel: department + " " + course
    });
    ga('send', {
        hitType: 'event',
        eventCategory: 'course-number',
        eventAction: department,
        eventLabel: course,
        eventValue: 0
    });
}

/**
 * Submits new course request for all sections of a course.
 *
 * @param courseLength Course ID in the global schedule object
 * @param department The department for the course (eg CSCI)
 * @param course The course number (eg 203)
 * @param section An optional specific section (eg 01)
 */
function submitCourseRequest(courseLength, department, course, section) {

    $.ajax({
        url: COURSE_LOOKUP_URL + department + '/' + course,
        context: {courseLength: courseLength, selectedSectionInfo: section}
    }).done(courseResponseHandler).fail(courseButtonErrorHandler);

}

/**
 * Submit new department request for all sections in a department.
 * @param dept The department (eg CSCI)
 */
function submitDeptRequest(dept) {
    let newDept = new Department(dept, "dept");
    let deptNum = sched.pushDept(newDept);

    $.ajax({
        url: DEPT_LOOKUP_URL + dept,
        context: {deptNum: deptNum}
    }).done(deptResponseHandler).fail(courseButtonErrorHandler);

    ga('send', {
        hitType: 'event',
        eventCategory: 'department',
        eventAction: 'add',
        eventLabel: dept
    });
}

/**
 * Submit new request for all other lookup types.
 * @param type The type of lookup (eg credit)
 * @param val The nickname for the type (eg Half Credit)
 * @param long The actual name for the type (eg .5)
 */
function submitOtherRequest(type, val, long) {
    let newDept = type == 'ccc' ? new Department(val,type) : new Department(long, type);
    let deptNum = sched.pushDept(newDept);

    $.ajax({
        url: OTHER_LOOKUP_URL + type + '/' + val,
        context: {deptNum: deptNum}
    }).done(deptResponseHandler).fail(courseButtonErrorHandler);

    let eventCat = type == 'ccc' ? type : 'credit';

    ga('send', {
        hitType: 'event',
        eventCategory: eventCat,
        eventAction: 'add',
        eventLabel: val
    });
}

/**
 * Handler function for new course data.
 * @param data Course data
 */
function courseResponseHandler(data) {
    sched.streamCourse(data.sections, this.courseLength, this.selectedSectionInfo);
}

/**
 * Handler function for new department data.
 * @param data Department data
 */
function deptResponseHandler(data) {
    sched.streamDept(data.courses, this.deptNum);
}

/**
 * Let the user know if the data fails to load.
 * @param e The event object to be logged in the console.
 */
function courseButtonErrorHandler(e) {
    let selector;
    if (this.courseLength !== undefined) {
        selector = "a[data-course='" + this.courseLength + "']";
    }
    else {
        selector = "a[data-dept='" + this.deptNum + "']";
    }
    console.log("course fail");
    console.log(e);
    $(selector + " .list-group-item-text .sectionCount").html("Loading Failed");
        // .siblings(".retryButton").show();
}

/**
 * Convert a time in the format (HH:MMam|pm).
 * @param time The time being converted (it can be either the start or end time for a section).
 * @return {number} Integer representing the number of 30 minute intervals past 8am for the provided time.
 */
export function parseHours(time) {
  let splitted = time.split(":");
  let hour = parseInt(splitted[0]);
  let minutes = parseInt(splitted[1].slice(0,2));
  let amOrPm = splitted[1].slice(2);

  if (amOrPm == "pm" && hour != 12) {
    hour += 12;
  }
  hour += -8 + minutes/60;

  return hour*2;
}

/**
 * Yes you can!
 */
export function justDoIt() {
    let text = $(this).val();
    text = text.toLowerCase();
    let doIt = ["doit", "do it", "just do it", "justdoit"];
    if (doIt.indexOf(text) !== -1) {
        $("#daysmonth").prepend(JUST_DO_IT);
        document.getElementById('doitvid').addEventListener('ended',function() {$(".shia-do-it").remove();},false);

        ga('send', {
            hitType: 'event',
            eventCategory: 'justdoit',
            eventAction: 'toggle'
        });

        $(this).typeahead("val", "");
    }
    if (text === "inception") {
        recCount = (typeof recCount === 'undefined') ? 0 : recCount;
        recCount++;
        let recString = '<iframe src="' + window.location.href + '" style="height:100%;width:100%;"></iframe>';
        if (recCount == 1) {
            $("#daysmonth").html(recString);
        }
        else if (recCount == 2) {
            $("#welcomeWell").html(recString);
        }

        $(this).typeahead("val", "");
    }
}

/**
 * Fixes some spacing issues with the backdrop when section details to the course table.
 */
export function updateCourseTableBackdrop() {
    // add space to the current dialog
    let newHeight = parseInt($("#courseTable .modal-dialog").css("height")) + 100;

    // set the backdrop to the new height if it doesn't have enough space
    let obj = $("#courseTable .modal-backdrop");
    if (parseInt(obj.css("height")) < newHeight) {
        obj.css("height", newHeight + "px");
    }
}

/**
 * Called when course button is clicked (and in other cases) to update available sections
 * @param y The course ID
 * @param selected The selected section for the course, if any
 * @param hidden True if the current course being drawn is not the course that was clicked
 * @param color Color of the sections
 * @param sections All sections for the current course
 */
export function drawToScreen(y, selected, hidden, color, sections) {
    let generated_list = [];
    for (let x in sections) { // iterates through sections and draws
        // true if section is unselected section that be an option to select
        let hidden2;
        if (selected === null || x != selected) {
            hidden2 = true;
            if (hidden) {
                continue;
            }
        }
        else {
            hidden2 = false;
        }
        sections[x].genElement('course' + y, hidden2, x, color);
        if (!hidden) {
            generated_list.push(sections[x].listGen('course' + y, !hidden2, x));
        }
    }
    let sectionListHTML = sectionList(generated_list);
    $("#listViewData tbody").append(sectionListHTML);
}

/**
 * Called to check for a new section selection.
 */
export function sectionSelectionHandler() {
    $("#sectionDetails").html("");
    let row = $("#listViewData .success");
    let $sectionTable = $("#listViewData tbody");
    let isDept = $sectionTable[0].hasAttribute("data-dept-level");
    let clickedSection, clickedCourse = null;
    if (row.length > 0) {
        let id = row.attr('id');
        clickedSection = id.substring(7);
    }
    if (isDept && row.length != 0) {
        let dept = $sectionTable.attr("data-dept-level");
        clickedCourse = row.attr("class").split(" ")[0].substring(6);
        sched.convertDeptToCourse(clickedCourse, clickedSection);
        sched.redrawData();
    }
    else {
        clickedCourse = sched.lastClickedCourseButton.id;
        if (row.length == 0) {
            let schedClickedSection = sched.selected[clickedCourse];
            if (schedClickedSection != null) { // set to self to reset
                sched.handleSelect(clickedCourse, schedClickedSection);
                sched.redrawData();
            }
        }
        else if (sched.selected[clickedCourse] == clickedSection) { // no change
        }
        else { // set to new
            sched.handleSelect(clickedCourse, clickedSection);
            sched.redrawData();
        }
    }
}

/**
 * Generates a new schedule when one is selected from the saved schedule list.
 */
export function newScheduleFromConfig() {
    let selectedConfig = $(this).attr("id").substring(12);

    // remove old courses and course buttons
    for (let y in sched.course) {
        $('.course' + y).remove();
    }
    $(".course-button").parent().remove();

    // replace schedule object
    sched = new Schedule();

    // retrieve saved schedule from local storage
    let configData = localStorage.getItem("courseConfigData" + selectedConfig);
    let courseData = JSON.parse(configData).courseData;

    // send requests for the courses
    for (let courseNum in courseData) {
        let currentCourse = courseNum.split(" ");
        addNewCourse(currentCourse[0], currentCourse[1], JSON.stringify(courseData[courseNum]));
    }

    $("#openModal").modal("hide");
}

/**
 * Initializes typeahead (search box) to use pre-loaded course descriptions and type names.
 * @param metadata Information about courses such as course descriptions, department names, CCC requirements, etc
 */
export function initializeTypeahead(metadata) {
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

    // initialize typeahead
    $('#remote .typeahead').typeahead({highlight: true}, typeaheadConfiguration);
}

/**
 * Called when the generate custom link button is clicked. Uploads course configuration and sets
 * the returned custom link in the GUI.
 */
export function generateCustomLink() {
    if ($(this).hasClass("disabled")) {
        return;
    }
    // hide warning about needing to generate a new custom link
    $("#generatedLink .glyphicon").hide();
    showTooltip = false;

    // set link indicator to uploading
    $("#openGenerateLinkModal")
        .addClass("disabled")
        .find("span")
        .removeClass("glyphicon-cloud")
        .removeClass("glyphicon-ok")
        .addClass("glyphicon-cloud-upload");

    // send course data
    let courseData = generateCourseDataToStore();
    $.when(
        $.get(STORE_CONFIG_URL, {config: JSON.stringify(courseData)})
    ).then(function (data) {
        // set custom link status to complete and set the new link
        $("#openGenerateLinkModal span")
            .removeClass("glyphicon-cloud-upload")
            .addClass("glyphicon-ok");
        $("#generatedLinkHolder").html("no8.am/bucknell/" + data.shortLink);
        $("#generatedLink").slideDown();
    });
}

/**
 * Called when an item is selected from the typeahead search box. Checks the item type (eg course, CCC, etc)
 * and calls the relevant retrieval function.
 * @param _ Unused input, reference to Typeahead in the DOM
 * @param datum The data that was selected from the search box
 */
export function handleNewInput(_, datum){

    // clear input from typeahead
    $(this).typeahead('val', "");

    // lookup department
    if (datum.category === "department") {
        let dept = datum["abbreviation"];
        submitDeptRequest(dept);
    }
    // lookup CCC requirement
    else if (datum.category === "ccc") {
        let ccc = datum["abbreviation"];
        submitOtherRequest('ccc', ccc, datum["name"]);
    }
    // lookup by credit
    else if (datum.category === "credit") {
        let cred = datum["abbreviation"];
        submitOtherRequest('credit', cred, datum["name"]);
    }
    // lookup course number
    else {
        let courseNum = datum["courseNum"];
        let currentCourse = courseNum.split(' ');
        addNewCourse(currentCourse[0], currentCourse[1], null);
    }
}

/**
 * Called when the remove button is clicked for a course button.
 * @param e The default event in response to the click.
 */
export function removeCourseButtonHandler(e) {
    e.stopPropagation();
    let parentobj = $(this).parent().parent();
    if (parentobj[0].hasAttribute("data-dept")) {
        sched.removeDept(parentobj.attr("data-dept"));
    }
    else {
        let parent = parentobj.attr("data-course");
        sched.removeCourse(parent);
    }
    parentobj.parent().slideUp('fast', function() {
        parentobj.parent().remove();
    });
}

/**
 * Initialize templates for dynamically generating and inserting HTML.
 */
export function initializeHandlebarsTemplates() {
    calendarElement = Handlebars.compile($("#calendarElement").html());
    buttonGroup = Handlebars.compile($("#buttonGroupTemplate").html());
    extraSectionsButton = Handlebars.compile($("#extraSectionsButtonTemplate").html());
    sectionList = Handlebars.compile($("#sectionTableTemplate").html());
    sectionDetails = Handlebars.compile($("#sectionDetailsTemplate").html());
    courseOverlap = Handlebars.compile($("#overlapTemplate").html());
    savedSchedule = Handlebars.compile($("#savedScheduleTemplate").html());
    crnTable = Handlebars.compile($("#crnTableTemplate").html());
    Handlebars.registerPartial("courseButton", $("#courseButtonPartialTemplate").html());
}

/**
 * Called when the course-revert button is clicked to revert a course to a course-group.
 * @param e
 */
export function revertToCourseGroupButtonHandler(e) {
    let parent = $(this).parent().parent().attr("data-course");
    sched.convertCourseToDept(parent);
    e.stopPropagation();
}

/**
 * Called when a sections list button is clicked.
 */
export function viewSectionListButtonHandler() {
    if ($(this)[0].hasAttribute("data-dept")) {
        let dept = $(this).attr("data-dept");
        sched.lastClickedCourseButton = {"type": "dept", "id": dept};
        sched.redrawDeptData(dept);
        $("#courseTable").modal();
    }
    else {
        let id = $(this).attr('data-course');
        if ($(this).hasClass("disabled") === false) {
            sched.lastClickedCourseButton = {"type": "course", "id": id};
            sched.redrawData();
            $("#courseTable").modal();
        }
    }
}

/**
 * Called when a section in the calendar is clicked. Opens the course table modal
 * for that course.
 */
export function viewSectionListFromCalendarHandler() {
    let clickedCourse = $(this).attr('class').split(' ')[0].substring(6);
    sched.lastClickedCourseButton = {"type": "course", "id": clickedCourse};
    sched.redrawData();
    $("#courseTable").modal();
}

/**
 * Sends an error report with the values in the modal fields.
 */
export function sendReport() {
    let errorDescription = $("#errorDescription").val();

    if (errorDescription !== "") {
        $(".reportRequired").removeClass("has-error");
        $.get(APP_ROOT + "/reportError", {
            errorDescription: errorDescription,
            name: $("#reportName").val(),
            email: $("#reportEmail").val(),
            useragent: navigator.userAgent,
            schedule: JSON.stringify(generateCourseDataToStore())
        });
        $("#reportErrorModal").modal('hide');
        $("#alertRegion").append(REPORT_SENT_MESSAGE);
    }
    else {
        $(".reportRequired").addClass("has-error");
    }
}

/**
 * Switches to the view selections window.
 */
export function viewSelectionsButtonHandler() {
    $(".editRegion").slideUp();
    $(".viewRegion").slideDown();
    $("#openGenerateLinkModal").removeClass("disabled");
    if (showTooltip) {
        $("#generatedLink .glyphicon").show();
        $("#generatedLink .glyphicon").popover({placement: 'left', trigger: 'hover', content: NEW_CUSTOM_LINK_WARNING});
    }
    sched.updateCRNList();
}

/**
 * Switches to the edit window.
 */
export function editButtonHandler() {
    $("#generatedLink .glyphicon").tooltip("destroy");
    $(".viewRegion").slideUp();
    $(".editRegion").slideDown();
}

/**
 * Called when the report error modal is closed. Clears all values in the modal.
 */
export function clearReportErrorModal() {
    $("#reportCourseNum").val("");
    $("#reportName").val("");
    $("#reportEmail").val("");
    $(".reportRequired").removeClass("has-error");
}

/**
 * Called when a section is hovered over in the calendar. Toggles between times met and the course
 * name for each instance of that section.
 */
export function calendarSectionHoverHandler(){
    let stuff = $(this).attr("class").split(" ");
    let selector = 'li.' + stuff[0] + '.' + stuff[1];
    $(selector + " .timesMet").toggle();
    $(selector + " .courseNum").toggle();
}

/**
 * Called when a section in the section list is hovered over or unhovered. Toggles the visibility
 * of each instance of that section.
 */
export function courseTableSectionHoverHandler() {
    if ($(this).parent().is("tbody")) {
        let clickedCourse = $(this).attr('class').split(' ')[0];
        let clickedCourseNum = clickedCourse.substring(6);
        let id = $(this).attr('id');
        let idNum = id.substring(7);
        let $calendarSection = $("#calendar .course" + clickedCourseNum + ".section" + idNum);
        if (!$calendarSection.hasClass("selectedCalendarSection") && !$(this).hasClass("success")){
            $("#calendar ." + clickedCourse + "."+id).toggle().css("z-index", "5");
        }
    }
}

/**
 * Update course table and calendar when a section from the section list is clicked.
 */
export function courseTableSectionClickHandler() {
    if ($(this).hasClass("success")) {
        $(this).removeClass("success");
        $("#sectionDetails").html("");
        return;
    }
    $("#listViewData .success").removeClass("success");
    $(this).addClass("success");
    let clickedCourse = $(this).attr('class').split(' ')[0];
    let clickedCourseNum = clickedCourse.substring(6);
    let clickedSection = $(this).attr('class').split(' ')[1];
    let idNum = clickedSection.substring(7);
    let isDept = false;
    if ($("#listViewData tbody")[0].hasAttribute("data-dept-level")) {
        let dept = $(this).parent().attr("data-dept-level");
        $("#calendar [data-dept-num='" + dept + "'].unselectedCalendarSection").hide();
        isDept = true;
    }
    else {
        $("#calendar ." + clickedCourse + ".unselectedCalendarSection").hide();
    }
    $("#calendar ." + clickedCourse + "."+clickedSection).show();
    sched.getSectionDetails(isDept, clickedCourseNum, idNum);
}

/**
 * Show confirmation of schedule being saved.
 */
export function openSaveModalButtonHandler() {
    $("#saveModal").modal();
    $("#configBeingSaved").html(generateHTMLFromCourseData(generateCourseDataToStore()));
}

/**
 * Retry sending failed request.
 */
export function retryButtonHandler() {
    // TODO - implement retry handler or resend AJAX request in error handler
    let id = $(this).attr("data-course") !== undefined ? $(this).attr("data-course") : $(this).attr("data-dept");
}

/**
 * Setter method for showTooltop
 * @param newShowTooltip A new boolean value
 */
export function setShowTooltip(newShowTooltip) {
    showTooltip = newShowTooltip;
}
