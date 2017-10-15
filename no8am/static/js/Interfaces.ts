/**
 * Created by nadeem on 9/1/17.
 */

export interface ISectionUnparsed {
    CCC: string[]
    course: string
    courseName: string
    CRN: string
    department: string
    departmentAndBareCourse: string
    departmentAndCourse: string
    departmentAndCourseAndSection: string
    dependent_main_sections?: string[]
    freeSeats: string
    main?: boolean
    message: string
    resSeats: string
    roomMet: string[]
    prm: string
    professor: string[]
    sectionNum: string
    timesMet: string[]
    waitList: string
}

export interface ISection extends ISectionUnparsed {
    daysMet: any
}

export interface IMetadataUnparsed {
    abbreviation: string
    name: string
    info?: string
}

export interface IMetadata extends IMetadataUnparsed {
    userFriendlyFormat: string
    token: string
    itemType: any
}

export interface ISelectedSection {
    departmentAndBareCourse: string
    CRN: string
}