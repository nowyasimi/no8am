import {Course} from './Course';

// TODO - rename class to CourseGroup, since it's used for departments, ccc requirements, etc
export class Department {
    constructor(deptName, deptType) {
        this.deptName = deptName;
        this.courses = [];
        this.color = null;
        // TODO - make this an enum?
        this.deptType = deptType; // ccc, cred, or dept
    }

    initialRequest(data, color) {
        // create course objects for all courses in course group
        for (var x in data) {
            var newCourse = new Course(data[x].courseNum);
            newCourse.mainColor = color;
            newCourse.initialRequest(data[x].sections);
            this.courses.push(newCourse);
        }

        // return number of courses added
        return this.courses.length;
    }
}

