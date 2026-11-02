// HTML5-Base common 2022.09.29
import React, { Component } from 'react';
import { connect } from 'react-redux';
import './dropdown.scss';
import logoURL from './img/iHousing_Design.gif';
import HeadDropdown from './HeadDropdown';

class Head extends Component{

    logout= (event) =>{
        let {iHousingUrl} = this.props.homeInfo.menuInfo;
        window.location.href=iHousingUrl+"&moduleName=H5_logout";
    }
    componentWillMount() {}
    render(){
        // HomeAction is passing in as props to reduce compilation dependency
        let {homeInfo,homeActions,history}=this.props;
        let {fontsize,loginName,today,platform,menuInfo,language,sysMsg}=homeInfo;

        return(
            <div>
                <div className="app-logo">
                <img className="logo" src={logoURL} />
                    <div className="app-top">
                    <div className="select-size">
                        <input type="button" className={fontsize==="s-app"?"active":""} onClick={() => homeActions.changeValue("fontsize", "s-app")} />
                        <input type="button" className={fontsize==="l-app"?"active":""} onClick={() => homeActions.changeValue("fontsize", "l-app")} />
                        <input type="button" className={fontsize==="e-app"?"active":""} onClick={() => homeActions.changeValue("fontsize", "e-app")} />
                    </div>
                    <input className="btn-out" style={{ height: '30px', marginTop: 2}} type="button" onClick={this.logout} value={sysMsg["BTN.Logout"]}></input>
                    </div>
                    
                    <div className="app-user">
                    <p style={{'textDecoration':'underline'}}>{platform}</p>
                    <p>{loginName} &nbsp;&nbsp;&nbsp;{today}</p>
                    {/* <p>{loginName}</p>
                    <p>{today}</p> */}
                    </div>

                    <div className="app-user">
                    {language!=="en_US" && (
                    <p style={{'textDecoration':'underline','cursor':'pointer'}} 
                        onClick={() => {homeActions.changeLanguage("en_US"); }}>
                        <a>{sysMsg["LBL.ChgToenUS"]}</a></p>
                    )}

                    {language!=="zh_HK" && (
                    <p style={{'textDecoration':'underline','cursor':'pointer'}} 
                        onClick={() => {homeActions.changeLanguage("zh_HK"); }}>
                        <a>{sysMsg["LBL.ChgTozhHK"]}</a></p>
                    )}

                    {/* <p style={{'textDecoration':'underline','cursor':'pointer'}} 
                        onClick={() => {homeActions.changeValue("language", language==="en_US"?"zh_HK":"en_US");
                          msgActions.changeLanguage(language==="en_US"?"zh_HK":"en_US")}}><a>{language==="en_US"?"中文":"ENG"}</a></p>  */}
                    </div>
                </div>
                <div style={{width: 'fit-content'}}>
                <div className="grad1"> </div>
                <HeadDropdown history={history} menuInfo={menuInfo} language={language}/>
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    homeInfo: state.homeInfo,
})
export default connect(mapStateToProps)(Head);