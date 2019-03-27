import {colorDict, DAYS_OF_WEEK} from './Constants';

import {parseHours, calendarElement} from './base';

export class Section {
    constructor(object, CRN) {
        this.CRN = CRN;
        Object.assign(this, object);
        this.timesMet = Section.restructureHours(object["timesMet"]);
        this.roomMet = object["timesMet"].map(meeting => meeting["Location"])
          .filter(location => location !== null)
          .join(", ");
        this.professor = object["professor"].map(prof => prof["Display"])
          .join("; ");
        // format: {"M": [1,2], "W": [1,3]} so Monday is a class from 8am to 9am and
        // Wednesday is from 8am to 9:30am
        this.daysMet = [];
        this.parseTimesMet(object["timesMet"])
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

    static convertMilitaryTime(time) {

      if (typeof time === 'undefined' || time === null)
          return "TBA";

      // Convert hour part of string to integer.
      var hours = parseInt(time.substring(0, 2));

      // Convert minute part of string to integer.
      var minutes = parseInt(time.substring(2, 4));

      var ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'

      minutes = minutes < 10 ? '0' + minutes : minutes;
      var strTime = hours + ':' + minutes + ' ' + ampm;

      return strTime;
    }

    static restructureHours(meetingTimes) {
        var result = "";
        for (let meetingTime of meetingTimes) {
          for (let day of DAYS_OF_WEEK) {
              result += meetingTime[day] === "Y" ? day : "";
          }

          result += ` ${Section.convertMilitaryTime(meetingTime["Start"])}`;

          let time = Section.convertMilitaryTime(meetingTime["End"]);

          if (time !== "TBA") {
            result += ` - ${time} `;
          }
        }

        return result;
    }

    parseTimesMet(timesMet) {
        for (let x of timesMet) {
            let unparsedStart = x["Start"];
            let unparsedEnd = x["End"];

            if (unparsedStart == null || unparsedEnd == null) {
              continue;
            }

            let parsedStart = parseHours(unparsedStart);
            let parsedEnd = parseHours(unparsedEnd) - parsedStart;

            for (let day of DAYS_OF_WEEK) {
                if (x[day] === "Y") {
                    this.daysMet.push( [day, parsedStart, parsedEnd, x["Start"], x["End"]] );
                }
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
