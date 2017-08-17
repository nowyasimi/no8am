let React = require('react');

let classNames = require('classnames');

import {connect} from 'react-redux'

import {Menu, MenuItem, MenuDivider, Hotkey, Hotkeys, HotkeysTarget, Classes} from '@blueprintjs/core'
import {Omnibox} from '@blueprintjs/labs'

import {toggleSearchOmnibox, closeSearchOmnibox, openSearchOmnibox, fetchNewCourse} from '../actions/sectionActions'


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
            this.setState({loading: false, metadata: metadata.course});
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
                noResults={<MenuItem disabled text="No results." />}
                inputProps={{ onBlur: this.onItemSelect }}
                resetOnSelect={true}
            />
        );
    }

    itemListPredicate(query, itemList) {
        // const queryRegex = new RegExp(`(${query})`, 'gi');

        return itemList
            .filter(x => `${x.courseNum} ${x.courseName}`.toLowerCase().includes(query.toLowerCase()))
            .sort(courseSort(query))
            .slice(1, 50);
            // .map(x => ({
            //     ...x,
            //     courseNum: x.courseNum.replace(queryRegex, '<b>$1</b>'),
            //     courseName: x.courseName.replace(queryRegex, '<b>$1</b>')
            // }));
    }

    itemRenderer({ handleClick, isActive, item }) {
        const classes = classNames({
            [Classes.ACTIVE]: isActive,
            [Classes.INTENT_PRIMARY]: isActive
        });

        return <MenuItem
            className={classes}
            key={item.courseNum} text={`${item.courseNum} - ${item.courseName}`}
            label={item.info}
            onClick={handleClick}
        />;
    }

    onItemSelect = (item) => {
        if (this.props.isOpen) {
            console.log(item);

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
        isOpen: state.isSearchOmniboxOpen
    }
}

// Map Redux actions to component props
function mapDispatchToProps(dispatch) {
    return {
        onToggleSearchOmnibox: () => dispatch(toggleSearchOmnibox()),
        onCloseSearchOmnibox: () => dispatch(closeSearchOmnibox()),
        onOpenSearchOmnibox: () => dispatch(openSearchOmnibox())
    }
}


