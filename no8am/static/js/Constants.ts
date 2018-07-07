import {IColors} from "./Interfaces";

export enum CalendarSectionColorType {
    HOVER,
    SELECTED,
    UNSELECTED,
}

export enum Colors {
    blue,
    cyan,
    green,
    lightgreen,
    orange,
    pink,
    purple,
    red,
    teal,
    yellow,
}

export const colorMapping: IColors = {
    [Colors.blue]: {
        [CalendarSectionColorType.HOVER]: "#5c9ef9", // selected + hover
        [CalendarSectionColorType.SELECTED]: "#5496dd", // selected
        [CalendarSectionColorType.UNSELECTED]: "#A5CAFD", // unselected
    },
    [Colors.cyan]: {
        [CalendarSectionColorType.HOVER]: "#205c5d",
        [CalendarSectionColorType.SELECTED]: "#2d8284",
        [CalendarSectionColorType.UNSELECTED]: "#205c5d",
    },
    [Colors.green]: {
        [CalendarSectionColorType.HOVER]: "#98e857",
        [CalendarSectionColorType.SELECTED]: "#94e354",
        [CalendarSectionColorType.UNSELECTED]: "#C4E7A7",
    },
    [Colors.lightgreen]: {
        [CalendarSectionColorType.HOVER]: "#43bb41",
        [CalendarSectionColorType.SELECTED]: "#66cb65",
        [CalendarSectionColorType.UNSELECTED]: "#b1e6b0",
    },
    [Colors.orange]: {
        [CalendarSectionColorType.HOVER]: "#e6a153",
        [CalendarSectionColorType.SELECTED]: "#e99b34",
        [CalendarSectionColorType.UNSELECTED]: "#f2a98d",
    },
    [Colors.pink]: {
        [CalendarSectionColorType.HOVER]: "#f18bea",
        [CalendarSectionColorType.SELECTED]: "#f35ee1",
        [CalendarSectionColorType.UNSELECTED]: "#f09eee",
    },
    [Colors.purple]: {
        [CalendarSectionColorType.HOVER]: "#bc9de6",
        [CalendarSectionColorType.SELECTED]: "#a97be6",
        [CalendarSectionColorType.UNSELECTED]: "#c69fe5",
    },
    [Colors.red]: {
        [CalendarSectionColorType.HOVER]: "#ff6164",
        [CalendarSectionColorType.SELECTED]: "#ff454b",
        [CalendarSectionColorType.UNSELECTED]: "#FFA9AB",
    },
    [Colors.teal]: {
        [CalendarSectionColorType.HOVER]: "#338794",
        [CalendarSectionColorType.SELECTED]: "#3faabb",
        [CalendarSectionColorType.UNSELECTED]: "#88ced9",
    },
    [Colors.yellow]: {
        [CalendarSectionColorType.HOVER]: "#ffbd6a",
        [CalendarSectionColorType.SELECTED]: "#ffac4d",
        [CalendarSectionColorType.UNSELECTED]: "#FFD6A3",
    },
};

export enum DataLoadingState {
    FAILED,
    LOADED,
    LOADING,
    REFRESHING,
}

// items appear in search box in this order
export const SearchItemTypes = ["Credit", "CCC", "Department", "Course"];

export enum SearchItemType {
    CCC = "CCC",
    Course = "Course",
    Credit = "Credit",
    Department = "Department",
}

export const DAYS_OF_WEEK: string[] = ["M", "T", "W", "R", "F"];
export const DAYS_OF_WEEK_LONG: string[] = ["Mon", "Tue", "Wed", "Thu", "Fri"];
export const SECTION_TYPES: string[] = ["main", "R", "L", "P"];
export const EXTRA_SECTION_TYPES: string[] = ["R", "L", "P"];

const APP_ROOT_IMPORTED = APP_ROOT;
export const CCC_LOOKUP_URL: string = APP_ROOT_IMPORTED + "/category/ccc/";
export const CREDIT_LOOKUP_URL: string = APP_ROOT_IMPORTED + "/category/credit/";
export const DEPT_LOOKUP_URL: string = APP_ROOT_IMPORTED + "/course/";
export const SECTIONS_URL: string = APP_ROOT_IMPORTED + "/sections/";
export const SECTION_DETAILS_URL: string = APP_ROOT_IMPORTED + "/sectiondetails/";
export const STORE_CONFIG_URL: string = APP_ROOT_IMPORTED + "/storeConfig/";
