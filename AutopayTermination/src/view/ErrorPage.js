// HTML5-Base common 2022.11.09
import React, { Component } from 'react';

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import HomeActions from '../action/HomeAction';
import {getSession,getParameters} from '../service/util';

import '../style/App.scss';

class ErrorPage extends Component {

  constructor(props) {
    super(props);
  }
  render() {
    let { errorPage } = this.props.homeInfo;
    let { isNoPermission, resources, errorMsg } = errorPage;
    return(
      <div className="bg-main">
          <p className="systemName">
            Error
          </p>
          <div className="error">
            { 
              isNoPermission ? 
              <>
                <p>User has no access right to view the function or perform the action.</p>
                <p>It may be the user session is expired, or user does not have the required access right.</p>
                <p>Please relogin the system or login with another user.</p>
                <p className="errorResource">Resources: [{resources}]</p>
              </>
              :
              <> 
                <p>An error is encountered. Please refer to the message below and try again.</p>
                <p>Message: {errorMsg}</p>
              </>
            }
          </div>
      </div>
    )
  }
}
const mapStateToProps = state =>({
  homeInfo: state.homeInfo
});

const mapDispatchToProps = dispatch =>({
  homeActions: bindActionCreators(HomeActions,dispatch)
});

export default connect(mapStateToProps,mapDispatchToProps)(ErrorPage);
