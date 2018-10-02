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

export interface ISectionColor {
    color: Colors;
}

export interface ISectionMainWithColor extends ISectionMain, ISectionColor {}
export interface ISectionExtraWithColor extends ISectionExtra, ISectionColor {}

export interface ISectionUIProperties {
    conflicts: Section[];
    isManaged: boolean;
    isSelected: boolean;
    isUnavailable: boolean;
    isVisible: boolean;
}

export interface ISectionMainWithUIProperties extends ISectionMain, ISectionUIProperties {}
export interface ISectionExtraWithUIProperties extends ISectionExtra, ISectionUIProperties {}

export type SectionUnparsed =
    | ISectionUnparsed
    | ISectionExtraUnparsed;

export type Section =
    | ISectionMain
    | ISectionExtra;

export type SectionWithColor =
    | ISectionMainWithColor
    | ISectionExtraWithColor;

export type SectionWithUIProperties =
    | ISectionMainWithUIProperties
    | ISectionExtraWithUIProperties;

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

export type FilterTime = [number, number];

export interface ISearchItem {
    readonly color: Colors;
    readonly currentItemCourseAbbreviation: string | null;
    readonly isSelected: boolean;
    readonly originItemAbbreviation: string | null;
    readonly searchItemType: SearchItemType;
    readonly selectedCrns: string[];
}

export interface ISearchItemWithMatchingSections extends ISearchItem {
    readonly sectionsMatchingCourse: SectionWithColor[];
    readonly sectionsMatchingOrigin: SectionWithColor[];
    readonly selectedSectionsInSearchItem: SectionWithColor[];
}

export interface ICalendarReducer {
    readonly hoverCRN: string | null;
}

export interface IFilterReducer {
    filterCCCs: string[];
    filterTime: FilterTime;
    isAdvanced: boolean;
}

export interface ISearchReducer {
    readonly searchHistory: IMetadata[];
    readonly status: DataLoadingState;
    readonly metadata: IMetadata[];
}

export interface ISectionReducer {
    readonly allSections: Section[];
    readonly expirationSeconds: number | null;
    readonly lastUpdateSeconds: number | null;
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
