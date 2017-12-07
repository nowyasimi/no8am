import {CCC_LOOKUP_URL, COURSE_LOOKUP_URL, CREDIT_LOOKUP_URL} from "../Constants";
import {IMetadata, IMetadataUnparsed, ISection, ISectionUnparsed} from "../Interfaces";

export enum FilterActionType {
    CLICK_SHOW_SINGLE_COURSE = "CLICK_SHOW_SINGLE_COURSE",
    UPDATE_FILTER_TIME = "UPDATE_FILTER_TIME",
    CLICK_REMOVE_SHOW_SINGLE_COURSE = "CLICK_REMOVE_SHOW_SINGLE_COURSE",
    CLICK_ADVANCED_SECTION_SELECTION = "CLICK_ADVANCED_SECTION_SELECTION",
    OTHER_ACTION = "__any_other_action_type__",
}

export type FilterActions =
    | IClickShowSingleCourse
    | IUpdateFilterTime
    | IClickRemoveShowSingleCourse
    | IClickAdvancedSectionSelection
    | IOtherAction;

interface IOtherAction {
    type: FilterActionType.OTHER_ACTION;
}

interface IClickShowSingleCourse {
    departmentAndBareCourse: string;
    type: FilterActionType.CLICK_SHOW_SINGLE_COURSE;
}

export const clickShowSingleCourse = (section: ISection): IClickShowSingleCourse => {
    return {
        departmentAndBareCourse: section.departmentAndBareCourse,
        type: FilterActionType.CLICK_SHOW_SINGLE_COURSE,
    };
};

interface IUpdateFilterTime {
    filterTime: any;
    type: FilterActionType.UPDATE_FILTER_TIME;
}

export const updateFilterTime = (filterTime): IUpdateFilterTime => {
    return {
        filterTime,
        type: FilterActionType.UPDATE_FILTER_TIME,
    };
};

interface IClickRemoveShowSingleCourse {
    type: FilterActionType.CLICK_REMOVE_SHOW_SINGLE_COURSE;
}

export const clickRemoveShowSingleCourse = (): IClickRemoveShowSingleCourse => {
    return {
        type: FilterActionType.CLICK_REMOVE_SHOW_SINGLE_COURSE,
    };
};

interface IClickAdvancedSectionSelection {
    type: FilterActionType.CLICK_ADVANCED_SECTION_SELECTION;
}

export const clickAdvancedSectionSelection = (): IClickAdvancedSectionSelection => {
    return {
        type: FilterActionType.CLICK_ADVANCED_SECTION_SELECTION,
    };
};
