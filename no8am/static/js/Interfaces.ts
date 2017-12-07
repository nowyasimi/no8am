import {DataLoadingState} from "./Constants";

export interface ISectionUnparsed {
    CCC: string[];
    course: string;
    courseName: string;
    CRN: string;
    department: string;
    departmentAndBareCourse: string;
    departmentAndCourse: string;
    departmentAndCourseAndSection: string;
    freeSeats: string;
    message: string;
    resSeats: string;
    roomMet: string[];
    prm: string;
    professor: string[];
    sectionNum: string;
    timesMet: string[];
    waitList: string;
}

export interface ISectionParsed extends ISectionUnparsed {
    daysMet: any;
}

export interface ISectionMain extends ISectionParsed {
    main: boolean;
}

export interface ISectionExtra extends ISectionParsed {
    dependent_main_sections: string[];
}

export type ISection =
    | ISectionMain
    | ISectionExtra;

export interface IMetadataUnparsed {
    abbreviation: string;
    name: string;
    info?: string;
}

export interface IMetadata extends IMetadataUnparsed {
    userFriendlyFormat: string;
    token: string;
    itemType: any;
}

export interface ISelectedSection {
    departmentAndBareCourse: string;
    CRN: string;
}

export interface ISearchItem {
    readonly currentItemBaseAbbreviation: string;
    readonly isSelected: boolean;
    readonly originItemAbbreviation?: string;
    readonly selectedCrns: string[];
}

export interface ISearchItemWithAllAbbreviations extends ISearchItem {
    readonly currentItemAllAbbreviations: string[];
}

export interface ISearchReducer {
    readonly isSearchOmniboxOpen: boolean;
    readonly searchHistory: IMetadata[];
    readonly status: DataLoadingState;
    readonly metadata: IMetadata[];
}

export interface ISectionReducer {
    readonly allSections: ISection[];
    readonly searchItems: ISearchItem[];
    readonly sectionListHoverCrn: string | null;
    readonly status: DataLoadingState;
}

export interface ICalendarReducer {
    readonly hoverCRN: string;
}

export interface IAllReducers {
    readonly calendar: ICalendarReducer;
    readonly search: ISearchReducer;
    readonly sections: ISectionReducer;
}
