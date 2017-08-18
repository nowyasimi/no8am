let React = require('react');

let classNames = require('classnames');

import {connect} from 'react-redux'

import {MenuItem, Hotkey, Hotkeys, HotkeysTarget, Classes} from '@blueprintjs/core'
import {Omnibox} from '@blueprintjs/labs'

import {toggleSearchOmnibox, closeSearchOmnibox, openSearchOmnibox, searchItem} from '../actions/sectionActions'
import {SEARCH_ITEM_TYPE} from '../Constants'

@connect(mapStateToProps, mapDispatchToProps)
@HotkeysTarget
export default class SearchOmnibox extends React.Component {

    constructor() {
        super();

        this.state = {
            loading: true,
            metadata: []
        };

        $.getJSON(METADATA_URL, (metadata) => {
            let metadataList = [];

            for (let type in SEARCH_ITEM_TYPE)  {
                if (type != "HEADER") {
                    metadataList = metadataList.concat(metadata[type.toLowerCase()].map(x => ({
                        ...x,
                        itemType: type,
                        token: (type == "Course" ? `${x.courseNum} ${x.courseName}` : `${x.abbreviation} ${x.name}`).toLowerCase()
                    })));
                }
            }

            this.setState({loading: false, metadata: metadataList});
        });
    }


    renderHotkeys() {
        return (
            <Hotkeys>
                <Hotkey
                    allowInInput
                    global={true}
                    combo="meta + k"
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
                items={this.state.metadata}
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

        if ((noResults || noQuery) && this.props.searchHistory.length > 0) {
            return [{text: 'Recent Searches (No results)', itemType: SEARCH_ITEM_TYPE.HEADER}].concat(this.props.searchHistory);
        } else if ((noResults || noQuery) && this.props.searchHistory.length == 0) {
            return [{text: 'Search for CCC requirements, courses, or number of credits', itemType: SEARCH_ITEM_TYPE.HEADER}];
        }

        let filteredListWithHeaders = [];

        for (let type in SEARCH_ITEM_TYPE) {
            let itemsOfType = filteredList.filter(x => x.itemType == type);

            itemsOfType = type == "Course" ? itemsOfType.sort(courseSort(query)) : itemsOfType;

            filteredListWithHeaders = itemsOfType.length == 0 ? filteredListWithHeaders :
                filteredListWithHeaders.concat([{text: type, itemType: SEARCH_ITEM_TYPE.HEADER}]).concat(itemsOfType);
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
            case "Course":
                return <MenuItem
                    className={classes}
                    key={item.courseNum} text={`${item.courseNum} - ${item.courseName}`}
                    label={item.info}
                    onClick={handleClick}
                />;
            default:
                return <MenuItem
                    className={classes}
                    key={item.abbreviation} text={`${item.abbreviation} - ${item.name}`}
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

const courseSort = (query) => (a, b) => {
    //get input text
    let InputString = query;

    let inputLen = InputString.length;

    // get shortened courseNum, look at first len(InputString) letters
    let shortA = a.courseNum.substring(0,inputLen).toLowerCase();
    let shortB = b.courseNum.substring(0,inputLen).toLowerCase();

    // case 1: a and b are in same dept:
    // compare the letter ordering (eg MATH 120 vs MATH 200)
    if (InputString === shortA && InputString === shortB) {
        return a.courseNum.localeCompare(b.courseNum);
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
        return a.courseNum.localeCompare(b.courseNum);
    }
};


// Map Redux state to component props
function mapStateToProps(state) {
    return {
        isOpen: state.isSearchOmniboxOpen,
        searchHistory: state.searchHistory
    }
}

// Map Redux actions to component props
function mapDispatchToProps(dispatch) {
    return {
        onToggleSearchOmnibox: () => dispatch(toggleSearchOmnibox()),
        onCloseSearchOmnibox: () => dispatch(closeSearchOmnibox()),
        onOpenSearchOmnibox: () => dispatch(openSearchOmnibox()),
        onSearchItem: (item) => dispatch(searchItem(item))
    }
}


