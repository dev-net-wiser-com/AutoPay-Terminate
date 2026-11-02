// HTML5-Base common 2022.11.22
import React, { Component } from 'react';

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import HomeActions from '../action/HomeAction';
import {getSession} from '../service/util';
import {decodeSessionSecret} from '../service/authutil';
import {GET_SERVICE_URL} from '../service/serviceProxy';

import '../style/App.scss';

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // systemName:"iHousing",
      version:"version",
      // resolution:"Best Resolution is 1280*768",
    }
    if (!window.location.host.includes("localhost")) {
      if (this.props.history.action === "PUSH")
        window.location.href = GET_SERVICE_URL.iHousingLandingUrl;
      else
        this.props.history.goBack();
    }
  }
  componentDidMount(){
    // let systemName="";
    let version="";
    // let resolution="";
    if (getSession("ps")) {;
      let parameters = getSession("ps"); 
      parameters = decodeSessionSecret(parameters);
      // if(parameters.systemName){
      //   systemName=parameters.systemName;
      // }
      if(parameters.version){
        version=parameters.version;
      }
      // if(parameters.resolution){
      //   resolution=parameters.resolution;
      // }
    }
    this.setState({
      // systemName:systemName,
      version:version,
      // resolution:resolution
    });
  }
  render() {
    // let {systemName,version,resolution}=this.state
    let {version}=this.state;
    let { homeInfo}=this.props;
    let {sysMsg}=homeInfo;
    return(
      <div className="bg-main">
          <p className="systemName">{sysMsg["LBL.SystemName"]}</p>
          <p className="version">{version}</p>
          {/* <p className="version">{sysMsg["LBL.SysVersion"]} {version}</p> */}
          <p className="resolution">{sysMsg["LBL.BestViewed"]}</p>
          <form>

          </form>
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

export default connect(mapStateToProps,mapDispatchToProps)(Home);
