// HTML5-Base common 2022.11.15 
import React, { Component } from 'react';
import { Router } from 'react-router-dom';
import { createHashHistory } from 'history';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import './style/App.scss';
import { isEmpty, ticksTime, getUrlCode, saveSession, getSession } from './service/util';
import { decodeSessionSecret, extractPermittedPaths, isPathPermitted } from './service/authutil';
import MainRoutes from './routes/MainRoutes';
import Head from './component/HeadDropdown/Head';
import HomeAction from './action/HomeAction';
import { GET_SERVICE_URL, callMenuService } from './service/serviceProxy';
import { ModParam } from './service/moduleSetting';

const browserHistory = createHashHistory();

class App extends Component {
    
    forwardError() {
        let { homeActions } = this.props;
        let currentPath = browserHistory.location.pathname;
        let ps = browserHistory.location.search;

        homeActions.changeValue("errorPage", {
                isNoPermission: true,
                resources: currentPath,
                errorMsg: ""
        });
        browserHistory.push({ pathname: "/error" + ps });
    }

    forwardEntryPath(path) {
        let ps = browserHistory.location.search;
        browserHistory.push({ pathname: path + ps });
    }

    componentWillMount() {
        let { homeActions } = this.props;
        let date = new Date();
        let currentDate = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
        let tag = false;
        let param

        if (getSession("ps")) {
            param = getSession("ps");
        } else {
            param = getUrlCode("ps");
            saveSession("ps", param);
        }

        let loginid = "";
        let up = "";
        let platform = "";
        //let para= "loginid=hwlee&up=test&ts=1557217829";
        //let paraEncode= encodeURIComponent(rDecode(para));
        //alert(paraEncode);
        if (!isEmpty(param)) {
            let parameters = decodeSessionSecret(param);
            tag = ticksTime(parameters.ts);
            saveSession("param", param);
            saveSession("tag", tag);
            loginid = parameters.loginid;
            up = parameters.up; //permission

            if (parameters.platform) {
                platform = parameters.platform;
            }
        }
        /*
        if (!tag) {
        alert("The session is expired! The page will be closed! ");
        window.close();
        }*/
        if (getSession("fsize")) {
            homeActions.changeValue("fontsize", getSession("fsize"));
        }
        homeActions.changeValueJO({
            today: currentDate,
            loginName: loginid,
            platform: platform,
            up: up,
        })

        // Like PPS: initialize local navigation here, before cached/remote menus.
        if (process.env.NODE_ENV === 'development' &&
            ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname)) {
            const localMenu = [
                {
                    menuitem: {
                        id: 'local-its', label: 'ITS', moduleName: '', state: 0, href: '',
                        submenus: [
                            {
                                menuitem: {
                                    id: 'local-operations', label: 'Operations', moduleName: '', state: 0, href: '',
                                    submenus: [
                                        {
                                            menuitem: {
                                                id: 'local-autopay-input',
                                                label: 'Autopay Termination - Manual Input',
                                                moduleName: 'H5_autopay_terminateInput',
                                                state: 0, href: '', submenus: []
                                            }
                                        },
                                        {
                                            menuitem: {
                                                id: 'local-autopay-upload',
                                                label: 'Autopay Termination - Disk Upload',
                                                moduleName: 'H5_autopay_terminateUpload',
                                                state: 0, href: '', submenus: []
                                            }
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                }
            ];
            homeActions.changeValueJO({
                menuInfo: {
                    menus: localMenu,
                    url: GET_SERVICE_URL.baseUrl,
                    iHousingUrl: GET_SERVICE_URL.iHousingH5ToFlexUrl,
                    appName: ModParam.appName
                },
                permittedPaths: extractPermittedPaths(localMenu)
            });
            return;
        }

        //get and set menuInfo
        let menu = getSession("menu");
        let currentPath = browserHistory.location.pathname;
        let ps = browserHistory.location.search;

        if (!menu) {
            callMenuService("getValidMenuByGroupListJson", "?param0=" + up, (str) => {
                let permittedPaths = extractPermittedPaths(str);
                homeActions.changeValueJO({
                    menuInfo: {
                        menus: str,
                        url: GET_SERVICE_URL.baseUrl, //local URL
                        iHousingUrl: GET_SERVICE_URL.iHousingH5ToFlexUrl, //mainURL
                        appName: ModParam.appName
                    },
                    permittedPaths: permittedPaths,
                });

                let result = isPathPermitted(currentPath, permittedPaths);
                if (!result.isPermitted) {
                    this.forwardError();
                } else {
                    if (result.isChild) {
                        this.forwardEntryPath(result.entryPath);
                    }
                }
                saveSession("menu", JSON.stringify(str));
            });
        }
        // This part is also needed when considering url reload
        else {
            if (typeof menu === "string") menu = JSON.parse(menu);
            let permittedPaths = extractPermittedPaths(menu);
            homeActions.changeValueJO({
                menuInfo: {
                    menus: menu,
                    url: GET_SERVICE_URL.baseUrl, //local URL
                    iHousingUrl: GET_SERVICE_URL.iHousingH5ToFlexUrl, //mainURL
                    appName: ModParam.appName
                },
                permittedPaths: permittedPaths,
            });

            let result = isPathPermitted(currentPath, permittedPaths);
            if(!result.isPermitted) {
                this.forwardError();
            } else {
                if (result.isChild) {
                    this.forwardEntryPath(result.entryPath);
                }
            }
        }
    }

    render() {
        let { homeInfo, homeActions  } = this.props;
        let { fontsize, permittedPaths } = homeInfo;
        let currentPath = browserHistory.location.pathname;

        return (
            <Router history={browserHistory} >
                <div className={fontsize} >
                    <Head history={browserHistory} homeActions={homeActions} />
                    <MainRoutes />
                </div>
            </Router>
        )
    }
}

const mapStateToProps = (state) => ({
    homeInfo: state.homeInfo,
})

const mapDispatchToProps = dispatch => ({
    homeActions: bindActionCreators(HomeAction, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(App);
