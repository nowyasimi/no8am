let React = require('react');
import {connect} from 'react-redux'
import {Icon} from '@blueprintjs/core'
import {Tooltip2} from '@blueprintjs/labs';

import {mouseEnterSectionListCard, mouseLeaveSectionListCard, clickSectionListCard}
from "../actions/sectionActions"


@connect(mapStateToProps, mapDispatchToProps)
export default class SectionListCard extends React.Component {
    render() {

        let isSelected = this.props.selectedSections.find(section => section.CRN == this.props.CRN);

        // identify if section is not available to choose based on current section selections
        let isUnavailable = this.props.selectedSections.find(section =>
            this.props.bare_course_number == section.bare_course_number &&
            (this.props.main && !section.main && !section.dependent_main_sections.includes(this.props.sectionNum)) ||
            (!this.props.main && section.main && !this.props.dependent_main_sections.includes(section.sectionNum))
        );

        // identify if section is selected and violates selection rules based on other selections
        let isViolation = isSelected && isUnavailable;

        let unavailableMessage = isUnavailable && !this.props.main ?
            `This section can be selected with one of the following main sections: ${this.props.dependent_main_sections}` :
            'This section cannot be selected due to other selections for this course';

        let classes = `${isSelected ? 'selectedSection' : ''} ${isUnavailable ? 'unavailableSection' : ''} ${isViolation ? 'violationSection' : ''} `;

        let sectionListCard = (
            <div className={`pt-card pt-interactive sectionCard ${this.props.isLastOfType ? 'lastOfType' : ''}`}
                 onMouseEnter={this.props.onMouseEnterSectionListCard}
                 onMouseLeave={this.props.onMouseLeaveSectionListCard}>
                <ul className={`sectionCardItemContainer ${classes}`}
                    onClick={this.props.onClickSectionListCard}>
                    <li className="sectionCardItem">
                        {this.props.courseNum}
                    </li>
                    <li className="sectionCardItem">
                        {this.props.timesMet}
                    </li>
                    <li className="sectionCardItem">
                        {this.props.roomMet}
                    </li>
                    <li className="sectionCardItem">
                        {this.props.professor}
                    </li>
                    <li className="sectionCardItem"
                        style={{width: '10%'}}>
                        {this.props.freeSeats}
                    </li>
                    <li className="sectionCardItem" style={{width: '7%'}}>
                        <Icon iconName="more" />
                    </li>
                </ul>
            </div>
        );

        return (<Tooltip2
                content={<span>{unavailableMessage}</span>}
                isOpen={this.props.sectionListHoverSection != undefined &&
                        this.props.sectionListHoverSection.CRN == this.props.CRN &&
                        isUnavailable != undefined}
                openOnTargetFocus={false}
                placement="right">
                {sectionListCard}
            </Tooltip2>);
    }
}

// Map Redux state to component props
function mapStateToProps(state) {
    return {
        selectedSections: state.selectedSections,
        sectionListHoverSection: state.sectionListHoverSection
    }
}

// Map Redux actions to component props
function mapDispatchToProps(dispatch, props) {
    return {
        onMouseEnterSectionListCard: () => dispatch(mouseEnterSectionListCard(props)),
        onMouseLeaveSectionListCard: () => dispatch(mouseLeaveSectionListCard()),
        onClickSectionListCard: () => dispatch(clickSectionListCard(props))
    }
}
