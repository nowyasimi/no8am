import * as React from 'react'
import * as classNames from 'classnames'

import {connect} from 'react-redux'

import {MenuItem, Hotkey, Hotkeys, HotkeysTarget, Classes} from '@blueprintjs/core'
import {Omnibox} from '@blueprintjs/labs'

import {closeSearchOmnibox, loadMetadata, openSearchOmnibox, searchItem, toggleSearchOmnibox} from '../actions/sectionActions'
import {IMetadata} from '../Interfaces'
import {SEARCH_ITEM_TYPE} from '../Constants'

export const searchKeyCombo = "mod + k";

@connect(mapStateToProps, mapDispatchToProps)
@HotkeysTarget
export class SearchOmnibox extends React.Component {

    componentDidMount() {
        this.props.onLoadMetadata();
    }

    renderHotkeys() {
        return (
            <Hotkeys>
                <Hotkey
                    allowInInput={true}
                    global={true}
                    combo={searchKeyCombo}
                    label="Toggle Omnibox"
                    onKeyDown={this.props.onToggleSearchOmnibox}
                />
                <Hotkey
                    allowInInput
                    disabled={!this.props.isOpen}
                    global={true}
                    combo="esc"
                    label="Close Omnibox"
                    onKeyDown={this.props.onCloseSearchOmnibox}
                />
            </Hotkeys>
        );
    }

    render() {
        return (
            <Omnibox
                isOpen={this.props.isOpen}
                itemListPredicate={this.itemListPredicate}
                itemRenderer={this.itemRenderer}
                items={this.props.metadata.items}
                onItemSelect={this.onItemSelect}
                inputProps={{ onBlur: this.onItemSelect }}
                resetOnSelect={true}
            />
        );
    }

    itemListPredicate = (query, itemList) => {

        let filteredList = itemList.filter(x => x.token.includes(query.toLowerCase()));

        let noResults = filteredList.length == 0;
        let noQuery = query == "";

        if (this.props.metadata.loading) {
            return [{text: 'Loading course information', itemType: SEARCH_ITEM_TYPE.HEADER}];
        } else if ((noResults || noQuery) && this.props.searchHistory.length > 0) {
            return [{text: 'Recent Searches (No results)', itemType: SEARCH_ITEM_TYPE.HEADER}]
                .concat(this.props.searchHistory.map(history => history.item));
        } else if ((noResults || noQuery) && this.props.searchHistory.length == 0) {
            return [{text: 'Search by CCC, course, or number of credits', itemType: SEARCH_ITEM_TYPE.HEADER}];
        }

        let filteredListWithHeaders = [];

        for (const type of SEARCH_ITEM_TYPE.enumValues) {
            let itemsOfType = filteredList.filter(x => x.itemType == type);

            itemsOfType = type == SEARCH_ITEM_TYPE.Course ? itemsOfType.sort(courseSort(query)) : itemsOfType;

            filteredListWithHeaders = itemsOfType.length == 0 ? filteredListWithHeaders :
                filteredListWithHeaders.concat([{text: type.name, itemType: SEARCH_ITEM_TYPE.HEADER}]).concat(itemsOfType);
        }

        return filteredListWithHeaders.slice(0, 50);

    };

    itemRenderer({ handleClick, isActive, item }) {
        const classes = classNames({
            [Classes.ACTIVE]: isActive,
            [Classes.INTENT_PRIMARY]: isActive
        });

        switch (item.itemType) {
            case SEARCH_ITEM_TYPE.HEADER:
                return <MenuItem
                    disabled
                    className={classes}
                    key={item.text} text={item.text}
                    onClick={handleClick}
                />;
            default:
                return <MenuItem
                    className={classes}
                    key={`${item.itemType}${item.token}`} text={item.userFriendlyFormat}
                    label={item.info}
                    onClick={handleClick}
                />;
        }
    }

    onItemSelect = (item) => {
        if (this.props.isOpen && item.hasOwnProperty("itemType")) {
            this.props.onSearchItem(item);

            this.props.onCloseSearchOmnibox();
        }
    };

}

const courseSort = (query) => (a: IMetadata, b: IMetadata) => {
    //get input text
    let InputString = query;

    let inputLen = InputString.length;

    // get shortened courseNum, look at first len(InputString) letters
    let shortA = a.abbreviation.substring(0,inputLen).toLowerCase();
    let shortB = b.abbreviation.substring(0,inputLen).toLowerCase();

    // case 1: a and b are in same dept:
    // compare the letter ordering (eg MATH 120 vs MATH 200)
    if (InputString === shortA && InputString === shortB) {
        return a.abbreviation.localeCompare(b.abbreviation);
    }
    // case 2: a is in dept, b isn't:
    else if (InputString === shortA && InputString !== shortB) {
        return -1;
    }
    // case 3: a isn't in dept, b is:
    else if (InputString !== shortA && InputString === shortB) {
        return 1;
    }
    // case 3: neither are in depts
    // compare the letter ordering (eg CSCI 200 vs ENGR 340)
    else {
        return a.abbreviation.localeCompare(b.abbreviation);
    }
};


// Map Redux state to component props
function mapStateToProps(state) {
    return {
        isOpen: state.isSearchOmniboxOpen,
        searchHistory: state.searchHistory,
        metadata: state.metadata
    }
}

// Map Redux actions to component props
function mapDispatchToProps(dispatch) {
    return {
        onToggleSearchOmnibox: () => dispatch(toggleSearchOmnibox()),
        onCloseSearchOmnibox: () => dispatch(closeSearchOmnibox()),
        onOpenSearchOmnibox: () => dispatch(openSearchOmnibox()),
        onSearchItem: (item) => dispatch(searchItem(item)),
        onLoadMetadata: () => dispatch(loadMetadata())
    }
}


