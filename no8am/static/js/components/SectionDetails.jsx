let React = require('react');

import {connect} from 'react-redux'


@connect(mapStateToProps)
export default class SectionDetails extends React.Component {

    constructor() {
        super();

        this.state = {
            sectionId: null
        };
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            sectionId: nextProps.highlight.sectionId
        });
    }

    render() {

        let sectionDetailsContainer = this.props.highlight.sectionDetails;

        console.log('section details');
        console.log(sectionDetailsContainer);

        let state = sectionDetailsContainer.state;
        if (state == "no selection") {
            return <div></div>;
        }
        else if (state == "loading") {
            return (
                <div className="spinner">
                    <div className="rect1"></div>
                    <div className="rect2"></div>
                    <div className="rect3"></div>
                    <div className="rect4"></div>
                    <div className="rect5"></div>
                </div>
            )
        }
        else if (state == "loaded") {
            let courseId = this.props.highlight.courseId;
            let sectionId = this.props.highlight.sectionId;

            let data = sectionDetailsContainer.data;
            let section = this.props.courses.find((x) => x.courseId == courseId).sections[sectionId];

            let $page = $($.parseHTML(data.section_details));
            let rows = $page.find("tr");
            let message = section.message || ":";
            let message_split_index = message.indexOf(":");

            let details = [];

            for (let x = 5; x < 10; x++) {
                if ($.trim(rows[x].children[1].innerText) != "") {
                    details.push(
                        <div key={`section${sectionId}sectiondetail${x}`}>
                            <b>{rows[x].children[0].innerText}</b> {rows[x].children[1].innerText}
                        </div>
                    );
                }
            }

            let message_contents = message == ":" ? "" : message.slice(message_split_index);

            let messageTitle = message.slice(0,message_split_index);
            let messageContents = message_contents;
            let title = section.courseName;

            let ccc = section.CCC;
            let waitList = section.waitList;
            let resSeats = section.resSeats;
            let prm = section.prm;

            return (
                <div>
                    <div style={{fontSize: '15px'}}>
                        <b> {messageTitle} </b> {messageContents}
                    </div>
                    <div>
                        <b>Title:</b> {title}
                    </div>
                    {ccc &&
                    <div>
                        <b>CCC:</b> {ccc}
                    </div>
                    }

                    {waitList &&
                    <div>
                        <b>Waitlist:</b> {waitList}
                    </div>
                    }

                    {resSeats &&
                    <div>
                        <b>Reserved Seats:</b> {resSeats}
                    </div>
                    }

                    {prm &&
                    <div>
                        <b>Prm:</b> {prm}
                    </div>
                    }

                    {details}
                </div>
            );
        }
    }
}

// Map Redux state to component props
function mapStateToProps(state) {
    return {
        highlight: {
            courseId: state.highlightCourseId,
            sectionId: state.highlightSectionId,
            sectionDetails: state.sectionDetails
        },
        courses: state.courses
    }
}

