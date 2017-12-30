export const colorDict = {
    blue: {
        h: "#5c9ef9", // selected + hover
        n: "#A5CAFD", // unselected
        s: "#5496dd", // selected
    },
    cyan: {
        h: "#205c5d",
        n: "#205c5d",
        s: "#2d8284",
    },
    green: {
        h: "#98e857",
        n: "#C4E7A7",
        s: "#94e354",
    },
    lightgreen: {
        h: "#43bb41",
        n: "#b1e6b0",
        s: "#66cb65",
    },
    orange: {
        h: "#e6a153",
        n: "#f2a98d",
        s: "#e99b34",
    },
    pink: {
        h: "#f18bea",
        n: "#f09eee",
        s: "#f35ee1",
    },
    purple: {
        h: "#bc9de6",
        n: "#c69fe5",
        s: "#a97be6",
    },
    red: {
        h: "#ff6164",
        n: "#FFA9AB",
        s: "#ff454b",
    },
    teal: {
        h: "#338794",
        n: "#88ced9",
        s: "#3faabb",
    },
    yellow: {
        h: "#ffbd6a",
        n: "#FFD6A3",
        s: "#ffac4d",
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
export const DAYS_OF_WEEK_LONG: string[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
export const SECTION_TYPES: string[] = ["main", "R", "L", "P"];
export const EXTRA_SECTION_TYPES: string[] = ["R", "L", "P"];

export const CCC_LOOKUP_URL: string = APP_ROOT + "/category/ccc/";
export const CREDIT_LOOKUP_URL: string = APP_ROOT + "/category/credit/";
export const DEPT_LOOKUP_URL: string = APP_ROOT + "/course/";
export const COURSE_LOOKUP_URL: string = APP_ROOT + "/course/";
export const SECTION_DETAILS_URL: string = APP_ROOT + "/sectiondetails/";
export const STORE_CONFIG_URL: string = APP_ROOT + "/storeConfig/";
export const SUCCESSFUL_SAVE_MESSAGE: string = '<div class="alert alert-success alert-dismissible saveSuccess" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><b>Saved!</b>  This schedule has been saved to your browser.</div>';
export const REPORT_SENT_MESSAGE: string = '<div class="alert alert-success alert-dismissible reportSuccess" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><b>Report sent!</b>  We\'ll fix it as soon as possible.</div>';
export const NEW_CUSTOM_LINK_WARNING: string = "You have modified your schedule. Be sure to generate a new custom link!";
export const JUST_DO_IT: string = '<div class="shia-do-it" style="margin-right: 30px;"><div class="container"><video id="doitvid" width="960" height="540" autoplay="" name="media" src="https://etaheri.github.io/output.webm" style="visibility: visible;"><source type="video/webm"></video></div></div>';
