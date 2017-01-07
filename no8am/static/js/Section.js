import {parseHours, calendarElement} from './base';

class Section {
    constructor(object, CRN) {
        this.CRN = CRN;
        this.courseNum = object["courseNum"];
        this.courseName = object["courseName"];
        this.sectionNum = object["sectionNum"];
        this.timesMet = this.restructureHours(object["timesMet"]);
        this.roomMet = object["roomMet"] === ", " ? "" : object["roomMet"];
        this.message = object["message"];
        this.professor = object["professor"] === "; " ? "" : object["professor"];
        this.freeSeats = object["freeSeats"];
        this.ccc = object["CCC"];
        this.resSeats = object["resSeats"];
        this.waitList = object["waitList"];
        this.prm = object["prm"];
        this.main = object["main"];
        this.daysMet = []; // format: {"M": [1,2], "W": [1,3]} so Monday is a class from 8am to 9am and
                           // Wednesday is from 8am to 9:30am
        this.parseTimesMet();
        this.extra_section_lists = {"L": [], "R": [], "P": []};
        var labs = object["labs"];
        var recitations = object["recitations"];
        var probSessions = object["probSessions"];

        if (object.hasOwnProperty('extra_section_lists')) {
            // Initial extra sections
            for (var index in Object.keys(this.extra_section_lists)) {
                var extra_section_type = Object.keys(this.extra_section_lists)[index];
                var current_extra_sections = object['extra_section_lists'][extra_section_type];
                for (var extra_section_crn in current_extra_sections) {
                    var new_section = new Section(current_extra_sections[extra_section_crn], extra_section_crn);
                    this.extra_section_lists[extra_section_type].push(new_section);
                }
            }

            // TODO - look into moving extra section independent into course (here and the API)
            this.extra_section_independent = object["extra_section_independent"]
        }
    }

    restructureHours(hours) {
        var timesMet = [];
        while (hours != '') {
            if (hours.length >= 3 && hours.slice(0,3) == "TBA") {
                return timesMet;
            }
            if (hours.length >= 4 && hours.slice(1,4) == "TBA") {
                return timesMet;
            }
            if (hours.length >= 5 && hours.slice(2,5) == "TBA") {
                return timesMet;
            }
            if (hours.length >= 6 && hours.slice(1,6) == "TBA") {
                return timesMet;
            }
            var mIndex = hours.indexOf('m');

            var tempTimes = hours.substring(0, mIndex+1);
            hours = hours.substring(mIndex+1);

            var tempHours = tempTimes.split(" ")[1];
            var startTime = tempHours.split("-")[0];
            var endTime = tempHours.split("-")[1];

            var cI1 = startTime.indexOf(":");
            var cI2 = endTime.indexOf(":");
            var hI = tempHours.indexOf("-");

            var startHour = parseInt(startTime.slice(0, cI1));
            var endHour = parseInt(endTime.slice(0, cI2));
            var amOrPm = endTime.slice(cI2 + 3);

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
        for (var x in this.timesMet) {
            var dayAndTime = this.timesMet[x].split(" ");
            var days = dayAndTime[0];
            var duration = dayAndTime[1];

            var time = duration.split("-");
            var start = time[0];
            var end = time[1];
            var parsedStart = parseHours(start);
            var parsedEnd = parseHours(end) - parsedStart;

            for (var day in days){
                if (days[day] == "S") {
                    continue;
                }
                this.daysMet.push( [days[day], parsedStart, parsedEnd, start.slice(0,-2), end.slice(0,-2)] );
            }
        }
    };

    genElement(classID, hidden, sectionNum, color) { // if selected, no 'N' in front
        var elements = [];
        for (var day in this.daysMet) {
            var visDuration;
            if (this.daysMet[day][1] + this.daysMet[day][2] > 26) {
                visDuration = 25.73 - this.daysMet[day][1];
            }
            else {
                visDuration = this.daysMet[day][2];
            }
            var hexColor;
            var selectedCalendarSection;
            var hiddenStyle = "";
            if (hidden) {
                hiddenStyle = "display:none;";
                hexColor = colorDict[color]["n"];
                selectedCalendarSection = " unselectedCalendarSection ";
            }
            else {
                hexColor = colorDict[color]["s"];
                selectedCalendarSection = " selectedCalendarSection ";
            }
            var options = {
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
            var generatedHTML = calendarElement(options);
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
    };

}



