function Schedule() {
  this.course = {};
  this.selected = {}; // tracks selected section for the course
  this.lastClickedCourseButton = {};
  this.courseLength = 1;
  this.departments = {};
  this.departmentLength = '1';
}

/**
 * Adds data for a course group waiting for course data.
 * @param courses Contains course data
 * @param deptNum The id that has is associated with the course group in the GUI
 */
Schedule.prototype.streamDept = function (courses, deptNum) {
    // initialize course group with courses
    var color = this.departments[deptNum].color;
    var numCourses = this.departments[deptNum].initialRequest(courses, color);

    // update GUI with the number of courses
    setNumberOfCourses(deptNum, numCourses);
};

/**
 *
 * @param data
 * @returns {number}
 */
Schedule.prototype.pushDept = function(data) {
    removeIntroInfo();

    data.color = this.generateColorArray(1)[0];

    this.departments[this.departmentLength] = data;

    var options = {
        deptNum: this.departmentLength,
        name: data.deptName,
        color: colorDict[data.color]["s"]
    };

    // TODO - if ccc type course group, add list of department names to options

    var buttonHTML = buttonGroup(options);

    var button1Length = $("#buttons-1 .list-group-item").length;
    var button2Length = $("#buttons-2 .list-group-item").length;

    var buttonLocation = (button1Length <= button2Length) ? "#buttons-1" : "#buttons-2";

    $(buttonLocation).append(buttonHTML);

    $("[data-dept="+ this.departmentLength + "]").parent().slideDown();

    return this.departmentLength++;
};

/**
 * Generates an array of colors by picking the least used colors.
 * @param numColors The number of colors to generate
 * @returns {Array} An array of colors
 */
Schedule.prototype.generateColorArray = function(numColors) {
  var usedColors = [];
  for (var i = 0; i < numColors; i++) {
    var current_color = colorChooser(this.course, this.departments, usedColors);
    usedColors.push(current_color);
  }
  return usedColors;
};

/**
 * Parses saved schedule data and calls section selection handler
 * if a section was saved for the course
 * @param selectedSections JSON formatted string of section data
 */
Schedule.prototype.parseSelectedSections = function (courseLength, selectedSections) {
    selectedSections = JSON.parse(selectedSections);
    for (var typeIndex in SECTION_TYPES) {
        var type = SECTION_TYPES[typeIndex];
        if (selectedSections.hasOwnProperty(type) && selectedSections[type] !== null) {
            this.searchAndSet(courseLength, selectedSections[type][0], type == "main" ? "" : type);
        }
    }
};

/**
 * Adds data for a course waiting for section data.
 * @param sections Contains sections data
 * @param courseLength The id that has is associated with the course group in the GUI
 */
Schedule.prototype.streamCourse = function (sections, courseLength, selectedSections) {

    if (sections.length === 0) {
        return;
    }

    // initialize course with sections
    var numSections = this.course[courseLength].initialRequest(sections);

    var a = this.course[courseLength].sections[0];

    var colors = this.generateColorArray(Object.keys(this.course[courseLength].extra_sections).length);
    var color_i = 0;

    var courseNum = this.course[courseLength].courseNum;

    var templateSections = [];

    for (var extra in this.course[courseLength].extra_sections) {
        var current_color = colors[color_i++];
        this.course[courseLength].extra_sections[extra] = current_color;
        if (this.course[courseLength].extra_section_independent[extra]) {
            this.course[courseLength].extra_section_lists[extra] = new ExtraCourse(a.extra_section_lists[extra], current_color);
        }

        var isIndependent = this.course[courseLength].extra_section_independent[extra];
        var extra_text = isIndependent ? this.course[courseLength].extra_section_lists[extra].sections.length + " Sections" : "Select Main Section First";

        var options = {
            name: courseNum + extra,
            courseId: courseLength + extra.toUpperCase(),
            color: colorDict[current_color]["s"],
            isExtra: true,
            isDisabled: !this.course[courseLength].extra_section_independent[extra],
            extra_text: extra_text
        };

        templateSections.push(options);
    }

    var buttonHTML = extraSectionsButton(templateSections);
    $("a[data-course='"+ courseLength +"']").parent().append(buttonHTML).children().slideDown();

    for (var extra in this.course[courseLength].extra_sections) {
        if (this.course[courseLength].extra_section_independent[extra]) {
            this.course[courseLength + extra] = this.course[courseLength].extra_section_lists[extra];
            this.selected[courseLength + extra] = null;
        }
    }

    // Parse and set saved course data, if it exists
    if (selectedSections !== null) {
        this.parseSelectedSections(courseLength, selectedSections);
    }

    this.updateCRNList();

    // update GUI with the number of sections
    setNumberOfSections(courseLength, numSections);
};

Schedule.prototype.pushData = function(courseInfo) { // for initial creation
    removeIntroInfo();

    var courseNum = courseInfo.courseNum;
    courseInfo.mainColor = this.generateColorArray(1)[0];

    var options = {
        name: courseNum,
        courseId: this.courseLength,
        color: colorDict[courseInfo.mainColor]["s"]
    };

    var buttonHTML = buttonGroup(options);

    if ($("#buttons-1 .list-group-item").length <= $("#buttons-2 .list-group-item").length) {
        $("#buttons-1").append(buttonHTML);
    }
    else {
        $("#buttons-2").append(buttonHTML);
    }

    this.course[this.courseLength] = courseInfo; // creates a dictionary in form {'1': object, '1R', object}
    this.selected[this.courseLength] = null;

    $(".anim" + this.courseLength).slideDown();

    return this.courseLength++;
};

/**
 * Calculates the total number of class hours per week. This value is
 * displayed in the GUI.
 */
Schedule.prototype.calculateClassHours = function() {
    var totalHours = 0;

    for (var section in this.selected) {
        if (this.selected[section] !== null){
            var daysMet = this.getSelectedSectionForCourse(section).daysMet;
            for (var i in daysMet) {
                totalHours += Math.round(daysMet[i][2])/2;
            }
        }
    }

    var stringFormatted = Math.round(totalHours * 100) / 100;
    $(".courseHours").text(stringFormatted);
};

/**
 * Gets the selected section for a course, if it exists.
 * @param courseIndex The index of the course in the course list
 * @returns Either the selected section or null if a section hasn't been selected
 */
Schedule.prototype.getSelectedSectionForCourse = function(courseIndex) {
    var sectionIndex = this.selected[courseIndex];
    var courseObject = this.course[courseIndex];

    return sectionIndex === null ? null : courseObject.sections[sectionIndex];
};

/**
 * Used for overlap detection. Generates an array for each day of the week, each
 * containing the start of end times of sections that meet on that day.
 * @returns {*[]} An array containing time intervals for each day of the week.
 */
Schedule.prototype.generateTimeIntervalsPerDay = function () {
    var weekDays = [[], [], [], [], []];

    for (var section in this.selected) {
        var sectionObject = this.getSelectedSectionForCourse(section);
        if (sectionObject !== null) {
            var daysMet = sectionObject.daysMet;
            for (var i in daysMet) {
                var dayWeek = daysMet[i][0];
                var interval = daysMet[i].slice(1);
                var iToPush = DAYS_OF_WEEK.indexOf(dayWeek);
                weekDays[iToPush].push({"course": section, "time": interval[0] + "s"}, {
                    "course": section,
                    "time": (interval[0] + interval[1]) + "e"
                });
            }
        }
    }

    return weekDays;
};

Schedule.prototype.overlapDetection = function() {
    var weekDays = this.generateTimeIntervalsPerDay();

    var overlaps = [];

    var tempCourse = "";
  for (var day in weekDays) {
    weekDays[day].sort(customSort);
    var inClass = false;
    for (var x in weekDays[day]) {
      var timeInt = weekDays[day][x].time;
      var startOrEnd = timeInt.substring(timeInt.length-1);
      if (startOrEnd == "s" && inClass === true) {
        var course2 = weekDays[day][x].course;
        var repeat = false;
          // place overlapping sections alongside each other
        $("#" + DAYS_OF_WEEK[day] + " .course" + tempCourse).css("width", "10%");
        $("#" + DAYS_OF_WEEK[day] + " .course" + course2).css("width", "10%").css("margin-left", "10%");

        for (var i = 0; i < overlaps.length; i++) {
          if ((overlaps[i]["course1Id"] == tempCourse && overlaps[i]["course2Id"] == course2) ||
                (overlaps[i]["course2Id"] == tempCourse && overlaps[i]["course1Id"] == course2)) {
            repeat = true;
            break;
          }
        }
        if (!repeat) {
          overlaps.push({
              course1Id: tempCourse,
              course2Id: course2,
              course1Name: this.course[tempCourse].courseNum,
              course2Name: this.course[course2].courseNum
          });
        }
      }
      else if (startOrEnd == "s" && inClass === false) {
        tempCourse = weekDays[day][x].course;
        inClass = true;
      }
      else if (startOrEnd == "e" && inClass === true) {
        inClass = false;
      }
    }
  }

  if (overlaps.length > 0) {
    var overlapStr = courseOverlap(overlaps);
    $("#doneEditing").addClass("course-overlap");
    $("#hasOverlap").show().html(overlapStr);
  }
  else {
    $("#doneEditing").removeClass("course-overlap");
    $("#hasOverlap").hide();
  }

  this.calculateClassHours();
};

/**
 * Calls section selection handler on a saved section by finding it in
 * the course's section list.
 * @param courseNum
 * @param sectionToSet
 * @param letter Empty string if a main section, or a letter like "R", "L", "P"
 */
Schedule.prototype.searchAndSet = function(courseNum, sectionToSet, letter){
  for (var x in this.course[courseNum + letter].sections) {
    if (this.course[courseNum + letter].sections[x].CRN == sectionToSet) {
      this.handleSelect(courseNum + letter, x.toString());
      this.redrawData();
    }
  }
};

/**
 * Checks extra courses once a main course is selected. Courses dependent
 * on the main course will be prepared for selection.
 * @param clickedCourse Index of course selected course list
 * @param clickedSection Index of section selected in course's list of sections
 * @param convertFromDept
 */
Schedule.prototype.updateExtraSectionsAfterMainSelect = function(clickedCourse, clickedSection, convertFromDept) {
    // loop through extra courses
    for (var extra in this.course[clickedCourse].extra_sections) {
        // ignore extra courses that are independent of the main course
        if (this.course[clickedCourse].extra_section_independent[extra]) {
            continue;
        }
        // TODO - see if this variable is necessary
        if (convertFromDept !== null) {
            // enable selection of extra section and update section count in GUI
            $('a[data-course="'+ clickedCourse + extra +'"]').removeClass('disabled');
            var sections_to_add = this.course[clickedCourse].sections[clickedSection].extra_section_lists[extra];
            this.course[clickedCourse + extra] = new ExtraCourse(sections_to_add, this.course[clickedCourse].extra_sections[extra]);
            $("a[data-course='"+ clickedCourse + extra +"']" + " .course-success").hide();
            setNumberOfSections(clickedCourse + extra, this.course[clickedCourse + extra].sections.length);
            this.selected[clickedCourse + extra] = null;
        }
    }
};

/**
 * Removes extra sections associated with a main section when a main
 * section is deselected.
 * @param clickedCourse
 */
Schedule.prototype.removeExtraSectionsAfterMainSelect = function(clickedCourse) {
    for (var extra in this.course[clickedCourse].extra_sections) {
        if (!this.course[clickedCourse].extra_section_independent[extra]) {
            $("a[data-course='"+ clickedCourse + extra +"']" + ' p').text("Select Main Section First");
            $("a[data-course='"+ clickedCourse + extra +"']").addClass('disabled');
            $("a[data-course='"+ clickedCourse + extra +"']" + " .course-success").hide();
            delete this.course[clickedCourse + extra]; // recitations for the section are no longer valid
            delete this.selected[clickedCourse + extra];
        }
    }
};

/**
 * Checks for extra sections affected by a selection and updates the GUI.
 * @param clickedCourse
 * @param clickedSection
 * @param convertFromDept
 */
Schedule.prototype.handleSelect = function(clickedCourse, clickedSection, convertFromDept) {

    // Check if course being handle is a main course by checking
    // if the last character of the course ID is a number
    var lastChar = clickedCourse.substring(clickedCourse.length-1);
    var isMainSection = Number(lastChar) == lastChar;

    // No section was previously chosen for this course
    if (this.selected[clickedCourse] === null) {
        $("a[data-course='"+ clickedCourse +"']" + " .course-success").show();
        if (isMainSection) { // for '1', '2', '3', etc
            this.updateExtraSectionsAfterMainSelect(clickedCourse, clickedSection, convertFromDept);
        }
        this.selected[clickedCourse] = clickedSection;
    }

    // Update selected section for this course
    else if (this.selected[clickedCourse] != clickedSection) {
        if (isMainSection) { // for '1', '2', '3', etc
            this.updateExtraSectionsAfterMainSelect(clickedCourse, clickedSection, convertFromDept);
        }
        this.selected[clickedCourse] = clickedSection;
    }

    // Remove previously chosen section for this course
    else {
        this.selected[clickedCourse] = null;
        $("a[data-course='"+ clickedCourse +"']" + " .course-success").hide();
        if (isMainSection) { // for '1', '2', '3', etc
            this.removeExtraSectionsAfterMainSelect(clickedCourse);
        }
    }

    // notify user that their custom link is out of date
    if ($("#generatedLinkHolder").text().length > 0) {
        showTooltip = true;
    }

    // send event to Google Analytics
    ga('send', {
        hitType: 'event',
        eventCategory: 'section',
        eventAction: 'select',
        eventLabel: this.course[clickedCourse].sections[clickedSection].courseNum
    });

    ga('send', {
        hitType: 'event',
        eventCategory: 'section-select',
        eventAction: this.course[clickedCourse].courseNum,
        eventLabel: this.course[clickedCourse].sections[clickedSection].sectionNum
    });
};

Schedule.prototype.convertCourseToDept = function(clickedCourse) {
  var courseInfo = this.course[clickedCourse];
  var dept_id = courseInfo.fromDeptButton;
  var dept = this.departments[dept_id];
  $("a[data-course='"+ clickedCourse +"']").removeAttr("data-course").attr("data-dept", dept_id);
  $("a[data-dept='" + dept_id + "'] .course-success").hide();
  $("a[data-dept='" + dept_id + "'] .courseNumBox").text(dept.deptName);
  $("a[data-dept='" + dept_id + "'] .course-revert").hide();
    setNumberOfCourses(dept_id, dept.courses.length);

  for (var extra in courseInfo.extra_sections) {
    $("a[data-course='"+ clickedCourse + extra +"']").slideUp('fast', function() {
      $(this).remove();
    });
  }

  this.removeCourse(clickedCourse);
};

Schedule.prototype.convertDeptToCourse = function(clickedCourse, clickedSection) {
    var dept = this.lastClickedCourseButton.id;
    var type = this.departments[dept].deptType;
    if (type == "dept") {
        var courseInfo = this.departments[dept].courses[clickedCourse];
        this.convertDeptToCourseHelper(dept, courseInfo, clickedSection, null);
    }
    else {
        var sectionObj = this.departments[dept].courses[clickedCourse].sections[clickedSection];
        var department = sectionObj.courseNum.split(" ")[0];
        var courseOrig = sectionObj.courseNum.split(" ")[1];
        var section = sectionObj.courseNum.split(" ")[2];
        var course = courseOrig;
        var extra = course.slice(course.length-1);

        // check if course is a main section or extra section
        if (extra > "9") {
            // remove extra section character from course number
            course = course.slice(0, course.length-1);
        }
        else {
            // not an extra section, so remove the test extra character
            extra = "";
        }

        // Update GUI with new course being retrieved
        $("a[data-dept='" + dept + "'] .courseNumBox").text(sectionObj.courseNum.split(" ").slice(0,2).join(" "));
        $("a[data-dept='" + dept + "'] .list-group-item-text .sectionCount").text("Loading Sections");

        // get the course data
        $.ajax({
            url: COURSE_LOOKUP_URL + department + '/' + course,
            context: {dept: dept, courseNum: department + " " + course, clickedSection: section, extra: extra}
        }).done(function(data) {
            var newCourse = new Course(this.courseNum);
            newCourse.initialRequest(data.sections);
            sched.convertDeptToCourseHelper(this.dept, newCourse, null, this);
        });
  }
};

Schedule.prototype.convertDeptToCourseHelper = function(dept, courseInfo, clickedSection, info) {
    var clickedCourse = this.courseLength.toString();

    var courseNum = courseInfo.courseNum;

    var testSection = courseInfo.sections[0];

    courseInfo.mainColor = this.departments[dept].color;

    var colors = this.generateColorArray(Object.keys(courseInfo.extra_sections).length);
    var color_i = 0;

    for (var extra in courseInfo.extra_sections) {
        var current_color = colors[color_i];
        courseInfo.extra_sections[extra] = current_color;
        color_i++;
        // TODO - set the extra course color to the dept color if extra course was selected
        if (courseInfo.extra_section_independent[extra]) {
            courseInfo.extra_section_lists[extra] = new ExtraCourse(testSection.extra_section_lists[extra], current_color);
            this.course[this.courseLength + extra] = courseInfo.extra_section_lists[extra];
            this.selected[this.courseLength + extra] = null;
        }
    }

    courseInfo.fromDeptButton = dept;
    this.course[this.courseLength] = courseInfo;
    this.selected[this.courseLength] = null;


    var clickedSectionNew = null;
    if (clickedSection == null) {
        var extra = info.extra;
        // need to find clickedSection, is main
        if (info.extra == "") {
            for (var section in courseInfo.sections) {
                if (courseInfo.sections[section].sectionNum == info.clickedSection) {
                    clickedSectionNew = section;
                }
            }
        }
        // need to find clickedSection, is extra
        else if (courseInfo.extra_section_lists.hasOwnProperty(extra) ) {
            clickedCourse = clickedCourse + extra;
            for (var section in courseInfo.extra_section_lists[extra].sections) {
                if (courseInfo.extra_section_lists[extra].sections[section].sectionNum == info.clickedSection) {
                    clickedSectionNew = section;
                }
            }
        }
        else {

        }
        // otherwise extra is dependent on main; rare edge case that's ignored
        // can be improved by attempting to link extras linked to only one main
    }
    else {
        clickedSectionNew = clickedSection;
    }

    var $courseButton = $("a[data-dept='" + dept + "']").attr("data-course", this.courseLength).removeAttr("data-dept");
    $courseButton.find(".courseNumBox").text(courseNum);
    $courseButton.find(".course-revert").show();

    setNumberOfSections(this.courseLength, courseInfo.sections.length);

    var templateSections = [];

    for (var extra in courseInfo.extra_sections) {
        var courseId = this.courseLength + extra
        var options = {
            name: courseNum + extra,
            courseId: courseId,
            color: colorDict[courseInfo.extra_sections[extra]]["s"],
            isExtra: true,
            isDisabled: !courseInfo.extra_section_independent[extra],
            extra_text: courseInfo.extra_section_independent[extra] ? courseInfo.extra_section_lists[extra].sections.length + " Sections" : "Select Main Section First"
        };

        templateSections.push(options);
    }

    var buttonHTML = extraSectionsButton(templateSections);
    $courseButton.parent().append(buttonHTML).children().slideDown();

    if (clickedSectionNew != null) {
        this.handleSelect(clickedCourse, clickedSectionNew, true); // select for this.course requires different coursenum
    }

    this.courseLength++;

    this.redrawData();
    this.updateCRNList();
};

/**
 * Redraws sections in course for selection by updating the calendar and the
 * table of sections.
 */
Schedule.prototype.redrawData = function() {

    // clear existing section details from the GUI
    $('#listViewData tbody').html("").removeAttr("data-dept-level");
    $('.open li').remove();

    // draws all sections for current course, and only selected sections for other courses
    for (var y in this.course) {
        var course_elements = this.course[y].drawToScreen(y, this.selected[y], y!=this.lastClickedCourseButton.id);
    }

    this.updateCRNList();
    this.overlapDetection();
};

/**
 * Redraws courses in course group for selection by updating the calendar and the
 * table of sections.
 *
 * @param dept The department that was selected for browsing.
 */
Schedule.prototype.redrawDeptData = function(dept) {

    // clear existing section details from the GUI
    $('#listViewData tbody').html("").attr("data-dept-level",dept);
    $('.open li').remove();

    // draw selected sections for each course
    for (var y in this.course) {
        this.course[y].drawToScreen(y, this.selected[y], true);
    }

    // draw courses for the currently selected department
    for (var y in this.departments[dept].courses) {
        this.departments[dept].courses[y].drawToScreen(y, null, false);
    }

    // link the course sections with the currently selected department
    $("#calendar .unselectedCalendarSection").attr("data-dept-num", dept);

    this.updateCRNList();
    this.overlapDetection();
};

/**
 * Remove Course and its ExtraCourses from schedule.
 * @param parent The root course
 */
Schedule.prototype.removeCourse = function(parent) {
  ga('send', {
    hitType: 'event',
    eventCategory: 'course',
    eventAction: 'remove',
    eventLabel: this.course[parent].courseNum
  });

  for (var extra in this.course[parent].extra_sections) {
    if (this.selected[parent + extra] !== null) {
      $(".course" + parent + extra).remove();
    }
    delete this.course[parent + extra]; delete this.selected[parent + extra];
  }

  if (this.selected[parent] !== null) {
    $(".course" + parent).remove();
  }

  delete this.course[parent]; delete this.selected[parent];

  this.redrawData();
};

/**
 * Remove a department from the schedule.
 * @param id The department ID
 */
Schedule.prototype.removeDept = function(id) {
  delete this.departments[id];
};

/**
 * Update list of selected sections, including CRNs.
 */
Schedule.prototype.updateCRNList = function() {
    var $crnPanel = $("#crnlist .panel-body");
    var crnListData = [];

    for (var course in this.selected) {
        if (this.selected[course] === null) {
            continue;
        }
        var current = this.getSelectedSectionForCourse(course);

        crnListData.push(current);
    }

    var crnListHTML = crnTable(crnListData);
    $crnPanel.html(crnListHTML);
};

/**
 * Get section details for a course and display in the sections list.
 * @param dept_id The ID for the department, if details are for a department
 * @param course The course to get details for.
 * @param sectionNum The specific section to get details for.
 */
Schedule.prototype.getSectionDetails = function(dept_id, course, sectionNum) {
  var section;
  if (dept_id)
    section = this.departments[this.lastClickedCourseButton.id].courses[course].sections[sectionNum];
  else
    section = this.course[course].sections[sectionNum];

  var crn = section.CRN;
  var dept = section.courseNum.split(" ")[0];

  $(".spinner2").show();

  $.ajax({
    url: SECTION_DETAILS_URL,
    data: {department: dept, crn: crn},
      context: {section: section},
    success: function(data) {
      $(".spinner2").hide();
        var section = this.section;
      $page = $($.parseHTML(data.section_details));
      var rows = $page.find("tr");
      var message = section.message || ":";
      var message_split_index = message.indexOf(":");

      var details = [];

      for (var x = 5; x < 10; x++) {
          if ($.trim(rows[x].children[1].innerText) != "") {
              details.push({
                  detailTitle: rows[x].children[0].innerText,
                  detailMessage: rows[x].children[1].innerText
              });
          }
      }

      var message_contents = message == ":" ? "" : message.slice(message_split_index);

      var options = {
          messageTitle: message.slice(0,message_split_index),
          messageContents: message_contents,
          title: section.courseName,
          ccc: section.ccc,
          waitList: section.waitList,
          resSeats: section.resSeats,
          prm: section.prm,
          details: details
      };

      var sectionDetailsHTML = sectionDetails(options);
      $("#sectionDetails").html(sectionDetailsHTML);
      updateCourseTableBackdrop();
    }
  });
};
