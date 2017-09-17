import * as React from 'react'

import {connect} from 'react-redux'
import {Tag} from '@blueprintjs/core'

import {clickRemoveShowSingleCourse} from '../actions/sectionActions'
import {SEARCH_ITEM_TYPE} from '../Constants'

import FilterTime from './FilterTime'

interface LookupFiltersProps {
    showSingleCourse: string
    singleCourseOrigin: string
    filterTime: any
    item: any
    numberOfSectionsVisible: number
    numberOfSectionsTotal: number
    onClickRemoveShowSingleCourse?: () => Promise<void>
}

@(connect(mapStateToProps, mapDispatchToProps) as any)
export default class LookupFilters extends React.Component<LookupFiltersProps, undefined> {

    render() {
        let isFromCategorySearch = this.props.item.itemType != SEARCH_ITEM_TYPE.Course &&
                               this.props.item.itemType != SEARCH_ITEM_TYPE.Department;

        let showSingleCourseTag = this.props.showSingleCourse == null ? null :
            (<Tag className="pt-large" onRemove={this.props.onClickRemoveShowSingleCourse}>
                {this.props.singleCourseOrigin} => {this.props.showSingleCourse}
            </Tag>);

        let sectionFilterString = this.props.numberOfSectionsVisible == this.props.numberOfSectionsTotal ? 'all' : 
            `${this.props.numberOfSectionsVisible} out of ${this.props.numberOfSectionsTotal}`;

        return (
            <div className="filters">
                <div>
                    Showing {sectionFilterString} sections
                </div>
                {showSingleCourseTag}
                <FilterTime filterTime={this.props.filterTime} />
            </div>
        );
    }
}

// Map Redux state to component props
function mapStateToProps(state) {
    return {
    }
}

// Map Redux actions to component props
function mapDispatchToProps(dispatch) {
    return {
        onClickRemoveShowSingleCourse: () => dispatch(clickRemoveShowSingleCourse())
    }
}

