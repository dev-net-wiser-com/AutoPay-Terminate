import React from 'react';
import { connect } from 'react-redux';

import { bindActionCreators } from 'redux';
import actions from '../action/AutopayTerminateInputAction';
import msgActions from '../action/MsgActions';

import 'bootstrap/dist/css/bootstrap.min.css';
import "react-table/react-table.css";
import '../style/autopay.scss';
import AutopayTerminateInputMain from './AutopayTerminateInputMain';

class AutopayTerminateInput extends React.Component {

    returnMain = (event) => {
        if (event) {
            event.preventDefault();
        }

        if (this.props.history) {
            this.props.history.push({ pathname: "/" });
        }
    }

    componentDidMount() {
        let { actions } = this.props;
        console.log("call componentDidMount");
    };

    render() {
        let { history } = this.props;
        return (
            <div>
                <AutopayTerminateInputMain history={history}/>
            </div>

        )
    }
}

const mapStateToProps = (state) => ({
    AutopayTerminateInputReducer: state.AutopayTerminateInputReducer,
    msgData: state.msgData
})

const mapDispatchToProps = dispatch => ({
    actions: bindActionCreators(actions, dispatch),
    msgActions: bindActionCreators(msgActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(AutopayTerminateInput);
