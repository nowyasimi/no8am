// TODO - use server generated current semester
CURRENT_SEMESTER = "Spring 2017"; // change during semester transitions

CREDITS = [
  {"shortCred": ".5", "long": "Half Credit"},
  {"shortCred": ".25", "long": "Quarter Credit"}
];

colorDict = {
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

DAYS_OF_WEEK = ["M", "T", "W", "R", "F"];
SECTION_TYPES = ["main", "R", "L", "P"];

OTHER_LOOKUP_URL = APP_ROOT + "/otherlookup/";
DEPT_LOOKUP_URL = APP_ROOT + "/deptlookup/";
COURSE_LOOKUP_URL = APP_ROOT + "/lookup/";
SECTION_DETAILS_URL = APP_ROOT + "/sectiondetails/";
STORE_CONFIG_URL = APP_ROOT + "/storeConfig/";

SUCCESSFUL_SAVE_MESSAGE = '<div class="alert alert-success alert-dismissible saveSuccess" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><b>Saved!</b>  This schedule has been saved to your browser.</div>';
REPORT_SENT_MESSAGE = '<div class="alert alert-success alert-dismissible reportSuccess" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><b>Report sent!</b>  We\'ll fix it as soon as possible.</div>';
NEW_CUSTOM_LINK_WARNING = "You have modified your schedule. Be sure to generate a new custom link!";
JUST_DO_IT = '<div class="shia-do-it" style="margin-right: 30px;"><div class="container"><video id="doitvid" width="960" height="540" autoplay="" name="media" src="https://etaheri.github.io/output.webm" style="visibility: visible;"><source type="video/webm"></video></div></div>';

CREDIT_HEADER = "<p style='font-size:24px; padding-left:10px'><b>Credits</b></p>";
CREDIT_SUGGESTION = "<div><p>{{{long}}}</p></div>";
CCC_HEADER = "<p style='font-size:24px; padding-left:10px'><b>CCC Requirements</b></p>";
CCC_SUGGESTION = "<div><p>{{{shortCCC}}} - {{{long}}}</p></div>";
DEPARTMENT_HEADER = "<p style='font-size:24px; padding-left:10px'><b>Departments</b></p>";
DEPARTMENT_SUGGESTION = "<div><p>{{{short}}} - {{{long}}}</p></div>";
COURSE_HEADER =  "<p style='font-size:24px; padding-left:10px'><b>Courses</b></p>";
COURSE_SUGGESTION = "<div><p>{{{courseNum}}} - {{{courseName}}}</p><p class='courseDescription'>{{info}}</p></div>";

TYPEAHEAD_OPTIONS = {
    credit : {
        token: ["long"],
        header: CREDIT_HEADER,
        suggestion: CREDIT_SUGGESTION,
        local: CREDITS
    },
    ccc : {
        token: ["shortCCC", "long"],
        header: CCC_HEADER,
        suggestion: CCC_SUGGESTION,
        local: CCC
    },
    department : {
        token: ["short", "long"],
        header: DEPARTMENT_HEADER,
        suggestion: DEPARTMENT_SUGGESTION,
        local: departments
    },
    course : {
        token: ["courseNum", "courseName"],
        header: COURSE_HEADER,
        suggestion: COURSE_SUGGESTION,
        local: courseDescriptions
    }
};
