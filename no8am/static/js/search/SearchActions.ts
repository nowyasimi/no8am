import {Dispatch} from "redux";
import {createAction} from "typesafe-actions";

import * as Constants from "../Constants";
import * as Interfaces from "../Interfaces";

export const receiveMetadata = createAction("RECEIVE_METADATA", (resolve) =>
    (metadata: Interfaces.IMetadata[]) => resolve({metadata}));

export const errorReceivingMetadata = createAction("ERROR_RECEIVING_METADATA");

export const loadMetadata = () => {
    return (dispatch: Dispatch<Interfaces.IAllReducers>) => {
        return fetch(METADATA_URL)
            .then((response) => response.json(),
                  (error) => dispatch(errorReceivingMetadata()))
            .then((rawMetadata) => parseMetadata(rawMetadata))
            .then((metadata) => dispatch(receiveMetadata(metadata)));
    };
};

const parseMetadata = (rawMetadata: any) => {
    let metadataList: Interfaces.IMetadata[] = [];

    for (const type of Constants.SearchItemTypes) {
        metadataList = metadataList
            .concat(rawMetadata[type.toLowerCase()].map((x: Interfaces.IMetadataUnparsed) => {
                const userFriendlyFormat = `${x.abbreviation} - ${x.name}`;
                return {
                    itemType: type,
                    token: userFriendlyFormat.toLowerCase(),
                    userFriendlyFormat,
                    ...x,
                };
        }));
    }

    return metadataList;
};
