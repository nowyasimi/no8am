import {Colors, DataLoadingState, SearchItemType} from "./Constants";

export interface ISectionUnparsed {
    credits: string;
    CCC: string[];
    course: string;
    courseName: string;
    CRN: string;
    department: string;
    departmentAndBareCourse: string;
    departmentAndCourse: string;
    departmentAndCourseAndSection: string;
    freeSeats: string;
    main: boolean;
    message: string;
    resSeats: string;
    roomMet: string[];
    prm: string;
    professor: string[];
    sectionNum: string;
    timesMet: string[];
    waitList: string;
}

export interface ISectionExtraUnparsed extends ISectionUnparsed {
    dependent_main_sections: string[];
}

export interface IMeetingTime {
    day: string;
    duration: number;
    startTime: number;
    startTimeUserFriendly: string;
    endTimeUserFriendly: string;
}

export interface IMeetingTimes {
    meetingTimes: IMeetingTime[];
}

export interface ISectionMain extends ISectionUnparsed, IMeetingTimes {}
export interface ISectionExtra extends ISectionExtraUnparsed, IMeetingTimes {}
export interface ISection extends ISectionMain, ISectionExtra {}

interface ISectionColor {
    color: Colors;
}

export interface ISectionMainWithColor extends ISectionMain, ISectionColor {}
export interface ISectionExtraWithColor extends ISectionExtra, ISectionColor {}

export type SectionUnparsed =
    | ISectionUnparsed
    | ISectionExtraUnparsed;

export type Section =
    | ISectionMain
    | ISectionExtra;

export type SectionWithColor =
    | ISectionMainWithColor
    | ISectionExtraWithColor;

export interface IMetadataUnparsed {
    abbreviation: string;
    name: string;
    info?: string;
}

export interface IMetadata extends IMetadataUnparsed {
    userFriendlyFormat: string;
    token: string;
    itemType: SearchItemType;
}

export interface ISelectedSection {
    departmentAndBareCourse: string;
    CRN: string;
}

export interface IColor {
    [color: number]: string;
}

export interface IColors {
    [color: number]: IColor;
}

export interface ISearchItem {
    readonly color: Colors;
    readonly currentItemCourseAbbreviation: string | null;
    readonly isSelected: boolean;
    readonly originItemAbbreviation: string | null;
    readonly searchItemType: SearchItemType;
    readonly selectedCrns: string[];
}

export interface ISearchItemWithMatchingSections extends ISearchItem {
    readonly sectionsInSearchItem: SectionWithColor[];
}

export interface ICalendarReducer {
    readonly hoverCRN: string | null;
}

export interface IFilterReducer {
    filterTime: [number, number];
    isAdvanced: boolean;
}

export interface ISearchReducer {
    readonly searchHistory: IMetadata[];
    readonly status: DataLoadingState;
    readonly metadata: IMetadata[];
}

export interface ISectionReducer {
    readonly allSections: Section[];
    readonly searchItems: ISearchItem[];
    readonly sectionListHoverCrn: string | null;
    readonly status: DataLoadingState;
}

export interface IAllReducers {
    readonly calendar: ICalendarReducer;
    readonly filters: IFilterReducer;
    readonly search: ISearchReducer;
    readonly sections: ISectionReducer;
}
