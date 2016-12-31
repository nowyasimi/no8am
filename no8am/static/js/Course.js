function Course(courseNum) {
  this.courseNum = courseNum == null ? "" : courseNum;
  this.extra_sections = {}; // eg {"r": "blue"} // recitation with color blue
  this.mainColor = null;
  this.sections = [];
  this.fromDeptButton = null; // changes during conversion method
  this.extra_section_independent = {};
  this.extra_section_lists = {};
}

Course.prototype.initialRequest = function(data) {
  var sections = [];
  var all = data;

  for (var x in all) { // handles all sections of a class for calendar addition
    var newSection = new Section(all[x], x);
    sections.push(newSection);
  }
  var testSection = sections[0];
  for (var x in testSection.extra_section_lists) {
      if (testSection.extra_section_lists[x].length > 0) {
        this.extra_sections[x] = null;
        this.extra_section_independent[x] = testSection.extra_section_independent[x];
      }
  }

  this.sections = sections;
  this.courseNum = sections[0].courseNum.split(" ").slice(0,2).join(" ");

    return this.sections.length;
};

Course.prototype.drawToScreen = function(y, selected, hidden) {
  drawToScreen(y, selected, hidden, this.mainColor, this.sections);
};

function ExtraCourse(data, color) {
  this.sections = data;
  this.color = color;
  this.courseNum = this.sections[0].courseNum.split(" ").slice(0,2).join(" ");
}

ExtraCourse.prototype.drawToScreen = function(y, selected, hidden) {
  drawToScreen(y, selected, hidden, this.color, this.sections);
};
