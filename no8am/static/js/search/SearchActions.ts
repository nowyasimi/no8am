import {ActionCreator} from "react-redux";
import {ThunkAction} from "redux-thunk";
import {createAction} from "ts-redux-actions";

import * as Constants from "../Constants";
import * as Interfaces from "../Interfaces";

import { getReturnOfExpression } from "react-redux-typescript";
import { searchItem } from "../sections/SectionActions";

// import {ISearchItemAction} from "../sections/SectionActions";

export const receiveMetadata = createAction("RECEIVE_METADATA",
    (metadata: Interfaces.IMetadata[]) => ({
        metadata,
        type: "RECEIVE_METADATA",
    }),
);

export const errorReceivingMetadata = createAction("ERROR_RECEIVING_METADATA",
    () => ({
        type: "ERROR_RECEIVING_METADATA",
    }),
);

type ILoadMetadataThunk = ActionCreator<ThunkAction<void, {}, {}>>;

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

export const toggleSearchOmnibox = createAction("TOGGLE_SEARCH_OMNIBOX",
    () => ({
        type: "TOGGLE_SEARCH_OMNIBOX",
    }),
);

export const closeSearchOmnibox = createAction("CLOSE_SEARCH_OMNIBOX",
    () => ({
        type: "CLOSE_SEARCH_OMNIBOX",
    }),
);

export const openSearchOmnibox = createAction("OPEN_SEARCH_OMNIBOX",
    () => ({
        type: "OPEN_SEARCH_OMNIBOX",
    }),
);

export const returnOfReceiveMetadata = getReturnOfExpression(receiveMetadata);
export const returnOfErrorReceivingMetadata = getReturnOfExpression(errorReceivingMetadata);
export const returnOfToggleSearchOmnibox = getReturnOfExpression(toggleSearchOmnibox);
export const returnOfCloseSearchOmnibox = getReturnOfExpression(closeSearchOmnibox);
export const returnOfOpenSearchOmnibox = getReturnOfExpression(openSearchOmnibox);
export const returnOfSearchItem = getReturnOfExpression(searchItem);

export type IActions =
    | typeof returnOfReceiveMetadata
    | typeof returnOfErrorReceivingMetadata
    | typeof returnOfToggleSearchOmnibox
    | typeof returnOfCloseSearchOmnibox
    | typeof returnOfOpenSearchOmnibox
    | typeof returnOfSearchItem;
