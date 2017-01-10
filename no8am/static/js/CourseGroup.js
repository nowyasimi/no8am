import {Course} from './Course';

// TODO - rename class to CourseGroup, since it's used for departments, ccc requirements, etc
export class CourseGroup {
    constructor(courseGroupName, courseGroupType) {
        this.deptName = courseGroupName;
        this.courses = [];
        this.color = null;
        // TODO - make this an enum?
        this.deptType = courseGroupType; // ccc, cred, or dept
    }

    initialRequest(data, color) {
        // create course objects for all courses in course group
        for (let x in data) {
            let newCourse = new Course(data[x].courseNum);
            newCourse.mainColor = color;
            newCourse.initialRequest(data[x].sections);
            this.courses.push(newCourse);
        }

        // return number of courses added
        return this.courses.length;
    }
}

