import React, { Component } from 'react';
import {getSession,getParameters} from '../service/util';
import '../style/App.scss';



class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      systemName:"iHousing",
      version:"version",
      resolution:"Best Resolution is 1280*768"   
    }
  }
  componentDidMount(){
    let systemName="";
    let version="";
    let resolution="";
    if (getSession("ps")) {
      let parameters = getSession("ps"); 
      parameters = getParameters(decodeURIComponent(parameters));
      if(parameters.systemName){
        systemName=parameters.systemName;
      }
      if(parameters.version){
        version=parameters.version;
      }
      if(parameters.resolution){
        resolution=parameters.resolution;
      }
    }
    this.setState({
      systemName:systemName,
      version:version,
      resolution:resolution
    });
  }
  render() {
    let {systemName,version,resolution}=this.state
    return(
      <div className="bg-main">
          <p className="systemName">{systemName}</p>
          <p className="version">{version}</p>
          <p className="resolution">{resolution}</p>
      </div>
    )
  }
}


export default Index;
