import {colorDict} from './Constants';

import {parseHours, calendarElement} from './base';

export class Section {
    constructor(object, CRN) {
        this.CRN = CRN;
        Object.assign(this, object);
        this.timesMet = Section.restructureHours(object["timesMet"]);
        this.roomMet = object["roomMet"] === ", " ? "" : object["roomMet"];
        this.professor = object["professor"] === "; " ? "" : object["professor"];
        this.daysMet = []; // format: {"M": [1,2], "W": [1,3]} so Monday is a class from 8am to 9am and
                           // Wednesday is from 8am to 9:30am
        this.parseTimesMet();
        this.extra_section_lists = {"L": [], "R": [], "P": []};

        if (object.hasOwnProperty('extra_section_lists')) {
            // Initial extra sections
            for (let extra_section_type of Object.keys(this.extra_section_lists)) {
                let current_extra_sections = object['extra_section_lists'][extra_section_type];
                for (let extra_section_crn in current_extra_sections) {
                    let new_section = new Section(current_extra_sections[extra_section_crn], extra_section_crn);
                    this.extra_section_lists[extra_section_type].push(new_section);
                }
            }

            // TODO - look into moving extra section independent into course (here and the API)
            this.extra_section_independent = object["extra_section_independent"]
        }
    }

    static restructureHours(hours) {
        let timesMet = [];
        while (hours != '') {
            if (hours.includes("TBA")) {
                return timesMet;
            }
            let mIndex = hours.indexOf('m');

            let tempTimes = hours.substring(0, mIndex+1);
            hours = hours.substring(mIndex+1);

            let tempHours = tempTimes.split(" ")[1];
            let startTime = tempHours.split("-")[0];
            let endTime = tempHours.split("-")[1];

            let cI1 = startTime.indexOf(":");
            let cI2 = endTime.indexOf(":");

            let startHour = parseInt(startTime.slice(0, cI1));
            let endHour = parseInt(endTime.slice(0, cI2));
            let amOrPm = endTime.slice(cI2 + 3);

            if (amOrPm == 'am' || (startHour != 12 && endHour == 12) || startHour > endHour) {
                tempTimes = tempTimes.split("-").join("am-");
            }

            else {
                tempTimes = tempTimes.split("-").join("pm-");
            }

            timesMet.push(tempTimes);
        }
        return timesMet;
    }

    parseTimesMet() {
        for (let x of this.timesMet) {
            let dayAndTime = x.split(" ");
            let days = dayAndTime[0];
            let duration = dayAndTime[1];

            let time = duration.split("-");
            let start = time[0];
            let end = time[1];
            let parsedStart = parseHours(start);
            let parsedEnd = parseHours(end) - parsedStart;

            for (let day of days){
                if (day === "S") {
                    continue;
                }
                this.daysMet.push( [day, parsedStart, parsedEnd, start.slice(0,-2), end.slice(0,-2)] );
            }
        }
    }

    genElement(classID, hidden, sectionNum, color) { // if selected, no 'N' in front
        let elements = [];
        for (let day in this.daysMet) {
            let visDuration;
            if (this.daysMet[day][1] + this.daysMet[day][2] > 26) {
                visDuration = 25.73 - this.daysMet[day][1];
            }
            else {
                visDuration = this.daysMet[day][2];
            }
            let hexColor;
            let selectedCalendarSection;
            let hiddenStyle = "";
            if (hidden) {
                hiddenStyle = "display:none;";
                hexColor = colorDict[color]["n"];
                selectedCalendarSection = " unselectedCalendarSection ";
            }
            else {
                hexColor = colorDict[color]["s"];
                selectedCalendarSection = " selectedCalendarSection ";
            }
            let options = {
                height: visDuration*20/5.6,
                margin: this.daysMet[day][1]*20/5.6,
                color: hexColor,
                selected: selectedCalendarSection,
                timesMet: this.daysMet[day][3] + "-" + this.daysMet[day][4],
                courseNum: this.courseNum.slice(0,-3),
                hidden: hiddenStyle,
                course: classID,
                section: sectionNum,
                day: this.daysMet[day][0]
            };
            elements.push(options);
            let generatedHTML = calendarElement(options);
            $("#" + this.daysMet[day][0] + " .open ul").append(generatedHTML);
        }
    }

    listGen(classID, selected, sectionNum) {
        return {
            isSelected: selected,
            classId: classID,
            sectionNum: sectionNum,
            courseNum: this.courseNum,
            timesMet: this.timesMet,
            roomMet: this.roomMet,
            professor: this.professor,
            freeSeats: this.freeSeats
        };
    }
}



