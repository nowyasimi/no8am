import {ThunkAction} from "redux-thunk";

import * as Constants from "../Constants";
import * as Interfaces from "../Interfaces";

import {ISearchItem} from "../sections/SectionActions";

export enum SearchActionType {
    RECEIVE_METADATA = "RECEIVE_METADATA",
    ERROR_RECEIVING_METADATA = "ERROR_RECEIVING_METADATA",
    TOGGLE_SEARCH_OMNIBOX = "TOGGLE_SEARCH_OMNIBOX",
    CLOSE_SEARCH_OMNIBOX = "CLOSE_SEARCH_OMNIBOX",
    OPEN_SEARCH_OMNIBOX = "OPEN_SEARCH_OMNIBOX",
    SEARCH_ITEM = "SEARCH_ITEM",
    OTHER_ACTION = "__any_other_action_type__",
}

export type SearchActions =
    | IReceiveMetadata
    | IErrorReceivingMetadata
    | IToggleSearchOmnibox
    | ICloseSearchOmnibox
    | IOpenSearchOmnibox
    | ISearchItem
    | IOtherAction;

interface IOtherAction {
    type: SearchActionType.OTHER_ACTION;
}

interface IReceiveMetadata {
    type: SearchActionType.RECEIVE_METADATA;
    metadata: Interfaces.IMetadata[];
}

export const receiveMetadata = (metadata: Interfaces.IMetadata[]): IReceiveMetadata => {
    return {
        metadata,
        type: SearchActionType.RECEIVE_METADATA,
    };
};

interface IErrorReceivingMetadata {
    type: SearchActionType.ERROR_RECEIVING_METADATA;
}

export const errorReceivingMetadata = (): IErrorReceivingMetadata => {
    return {
        type: SearchActionType.ERROR_RECEIVING_METADATA,
    };
};

type ILoadMetadataThunk = ThunkAction<void, {}, {}>;

export const loadMetadata = (): ILoadMetadataThunk => {
    return (dispatch) => {
        return fetch(METADATA_URL)
            .then((response) => response.json())
            .then((rawMetadata) => {
                let metadataList: Interfaces.IMetadata[] = [];

                for (const type of Constants.SEARCH_ITEM_TYPE.enumValues) {
                    if (type !== Constants.SEARCH_ITEM_TYPE.HEADER) {
                        metadataList = metadataList.concat(rawMetadata[type.name.toLowerCase()].map((x: Interfaces.IMetadataUnparsed) => {
                            const userFriendlyFormat = `${x.abbreviation} - ${x.name}`;
                            return {
                                itemType: type,
                                token: userFriendlyFormat.toLowerCase(),
                                userFriendlyFormat,
                                ...x,
                            };
                        }));
                    }
                }

                return metadataList;
            })
            .then((metadata) => dispatch(receiveMetadata(metadata)))
            .catch(dispatch(errorReceivingMetadata()));
    };
};

interface IToggleSearchOmnibox {
    type: SearchActionType.TOGGLE_SEARCH_OMNIBOX;
}

export const toggleSearchOmnibox = (): IToggleSearchOmnibox => {
    return {
        type: SearchActionType.TOGGLE_SEARCH_OMNIBOX,
    };
};

interface ICloseSearchOmnibox {
    type: SearchActionType.CLOSE_SEARCH_OMNIBOX;
}

export const closeSearchOmnibox = (): ICloseSearchOmnibox => {
    return {
        type: SearchActionType.CLOSE_SEARCH_OMNIBOX,
    };
};

interface IOpenSearchOmnibox {
    type: SearchActionType.OPEN_SEARCH_OMNIBOX;
}

export const openSearchOmnibox = (): IOpenSearchOmnibox => {
    return {
        type: SearchActionType.OPEN_SEARCH_OMNIBOX,
    };
};
