import {Enum} from 'enumify';

export const colorDict = {
  "blue":{
    "s": "#5496dd", // selected
    "h": "#5c9ef9", // selected + hover
    "n": "#A5CAFD"  // unselected
  },
  "red":{
    "s": "#ff454b",
    "h": "#ff6164",
    "n": "#FFA9AB"
  },
  "yellow":{
    "s": "#ffac4d",
    "h": "#ffbd6a",
    "n": "#FFD6A3"
  },
  "green":{
    "s": "#94e354",
    "h": "#98e857",
    "n": "#C4E7A7"
  },
  "purple":{
    "s": "#a97be6",
    "h": "#bc9de6",
    "n": "#c69fe5"
  },
  "orange":{
    "s": "#e99b34",
    "h": "#e6a153",
    "n": "#f2a98d"
  },
  "pink":{
    "s": "#f35ee1",
    "h": "#f18bea",
    "n": "#f09eee"
  },
  "teal":{
    "s": "#3faabb",
    "h": "#338794",
    "n": "#88ced9"
  },
  "cyan":{
    "s": "#2d8284",
    "h": "#205c5d",
    "n": "#205c5d"
  },
  "lightgreen":{
    "s": "#66cb65",
    "h": "#43bb41",
    "n": "#b1e6b0"
  }
};

export class DATA_LOADING_STATE extends Enum {}
DATA_LOADING_STATE.initEnum(["NO_SELECTION", "LOADING", "LOADED"]);

export const DAYS_OF_WEEK = ["M", "T", "W", "R", "F"];
export const DAYS_OF_WEEK_LONG = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
export const SECTION_TYPES = ["main", "R", "L", "P"];
export const EXTRA_SECTION_TYPES = ["R", "L", "P"];

export const CCC_LOOKUP_URL = APP_ROOT + "/category/ccc/";
export const CREDIT_LOOKUP_URL = APP_ROOT + "/category/credit/";
export const DEPT_LOOKUP_URL = APP_ROOT + "/course/";
export const COURSE_LOOKUP_URL = APP_ROOT + "/course/";
export const SECTION_DETAILS_URL = APP_ROOT + "/sectiondetails/";
export const STORE_CONFIG_URL = APP_ROOT + "/storeConfig/";
export const SUCCESSFUL_SAVE_MESSAGE = '<div class="alert alert-success alert-dismissible saveSuccess" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><b>Saved!</b>  This schedule has been saved to your browser.</div>';
export const REPORT_SENT_MESSAGE = '<div class="alert alert-success alert-dismissible reportSuccess" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><b>Report sent!</b>  We\'ll fix it as soon as possible.</div>';
export const NEW_CUSTOM_LINK_WARNING = "You have modified your schedule. Be sure to generate a new custom link!";
export const JUST_DO_IT = '<div class="shia-do-it" style="margin-right: 30px;"><div class="container"><video id="doitvid" width="960" height="540" autoplay="" name="media" src="https://etaheri.github.io/output.webm" style="visibility: visible;"><source type="video/webm"></video></div></div>';

export const CREDIT_HEADER = "<p style='font-size:24px; padding-left:10px'><b>Credits</b></p>";
export const CREDIT_SUGGESTION = "<div><p>{{{name}}}</p></div>";
export const CCC_HEADER = "<p style='font-size:24px; padding-left:10px'><b>CCC Requirements</b></p>";
export const CCC_SUGGESTION = "<div><p>{{{abbreviation}}} - {{{name}}}</p></div>";
export const DEPARTMENT_HEADER = "<p style='font-size:24px; padding-left:10px'><b>Departments</b></p>";
export const DEPARTMENT_SUGGESTION = "<div><p>{{{abbreviation}}} - {{{name}}}</p></div>";
export const COURSE_HEADER =  "<p style='font-size:24px; padding-left:10px'><b>Courses</b></p>";
export const COURSE_SUGGESTION = "<div><p>{{{courseNum}}} - {{{courseName}}}</p><p class='courseDescription'>{{info}}</p></div>";

export const TYPEAHEAD_OPTIONS = {
    credit : {
        token: ["abbreviation", "name"],
        header: CREDIT_HEADER,
        suggestion: CREDIT_SUGGESTION
    },
    ccc : {
        token: ["abbreviation", "name"],
        header: CCC_HEADER,
        suggestion: CCC_SUGGESTION
    },
    department : {
        token: ["abbreviation", "name"],
        header: DEPARTMENT_HEADER,
        suggestion: DEPARTMENT_SUGGESTION
    },
    course : {
        token: ["courseNum", "courseName"],
        header: COURSE_HEADER,
        suggestion: COURSE_SUGGESTION
    }
};

export class SEARCH_ITEM_TYPE extends Enum {}
SEARCH_ITEM_TYPE.initEnum(["HEADER", "Credit", "CCC", "Department", "Course"]);
