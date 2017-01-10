let React = require('react');

export class CalendarSection extends React.Component {
    render() {
        let style = {
            height: this.props.height + "%",
            marginTop: this.props.margin + "%",
            display: this.props.display,
            background: this.props.background,
        };

        return (
            <li style="{{hidden}} height: {{height}}%; margin-top: {{margin}}%;background:{{color}}" id="section{{section}}" class="{{course}} section{{section}} {{selected}} ">
                <p class="courseNum" style="display: block;">{{courseNum}}</p>
                <p style="display: none;" class="timesMet">{{timesMet}}</p>
            </li>
        );
    }
}
