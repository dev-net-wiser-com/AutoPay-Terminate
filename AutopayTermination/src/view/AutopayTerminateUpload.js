import React from 'react';
import { connect } from 'react-redux';

import { bindActionCreators } from 'redux';
import actions from '../action/AutopayTerminateUploadAction';
import msgActions from '../action/MsgActions';

import 'bootstrap/dist/css/bootstrap.min.css';
import "react-table/react-table.css";
import '../style/autopay.scss';
import AutopayTerminateUploadMain from './AutopayTerminateUploadMain';

class AutopayTerminateUpload extends React.Component {

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
        actions.init();

    };

    render() {
        let { history } = this.props;
        return (
            <div>
                <AutopayTerminateUploadMain history={history}/>
            </div>

        )
    }
}

const mapStateToProps = (state) => ({
    AutopayTerminateUploadReducer: state.AutopayTerminateUploadReducer,
    msgData: state.msgData
})

const mapDispatchToProps = dispatch => ({
    actions: bindActionCreators(actions, dispatch),
    msgActions: bindActionCreators(msgActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(AutopayTerminateUpload);
