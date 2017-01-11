import {drawToScreen} from './base';
import {Section} from './Section';

export class Course {
    constructor (courseNum) {
        this.courseNum = courseNum == null ? "" : courseNum;
        this.extra_sections = {}; // eg {"r": "blue"} // recitation with color blue
        this.color = null;
        this.sections = [];
        this.fromDeptButton = null; // changes during conversion method
        this.selected = null;
        this.extra_section_independent = {};
        this.extra_section_lists = {};
    }

    initialRequest(data) {
        let sections = [];
        let all = data;

        for (let x in all) { // handles all sections of a class for calendar addition
            let newSection = new Section(all[x], x);
            sections.push(newSection);
        }
        let testSection = sections[0];
        for (let x in testSection.extra_section_lists) {
            if (testSection.extra_section_lists[x].length > 0) {
                this.extra_sections[x] = null;
                this.extra_section_independent[x] = testSection.extra_section_independent[x];
            }
        }

        this.sections = sections;
        this.courseNum = sections[0].courseNum.split(" ").slice(0,2).join(" ");

        return this.sections.length;
    };

    courseDrawToScreen(y, selected, hidden) {
        drawToScreen(y, selected, hidden, this.color, this.sections);
    }
}

export class ExtraCourse {
    constructor(data, color) {
        this.sections = data;
        this.color = color;
        this.selected = null;
        this.courseNum = this.sections[0].courseNum.split(" ").slice(0,2).join(" ");
    }

    courseDrawToScreen(y, selected, hidden) {
        drawToScreen(y, selected, hidden, this.color, this.sections);
    }
}

