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
    currentItemBaseAbbreviation: string;
    currentItemAllAbbreviations: string[];
    isSelected: boolean;
    originItemAbbreviation?: string;
    selectedCrns: string[];
}

export interface ISearchReducer {
    isSearchOmniboxOpen: boolean;
    searchHistory: IMetadata[];
    status: DataLoadingState;
    metadata: IMetadata[];
}

export interface ISectionReducer {
    allSections: ISection[];
    searchItems: ISearchItem[];
    sectionListHoverCrn: string | null;
    status: DataLoadingState;
}

export interface ICalendarReducer {
    hoverCRN: string;
}

export interface IAllReducers {
    calendar: ICalendarReducer;
    search: ISearchReducer;
    sections: ISectionReducer;
}
