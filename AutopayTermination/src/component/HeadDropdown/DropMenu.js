// HTML5-Base common 2022.11.17
import React, { Component } from "react";
import "./dropdown.scss";
import $ from "jquery";
import { encodeSessionSecret } from '../../service/authutil';

const MenuMsg = {
    en_US: {
        "MSG.ConfirmLeavePage":     "Are you sure you want to leave this page?",
    },
    zh_HK: {
        "MSG.ConfirmLeavePage":     "確定離開此頁面?",
    }
 }

class DropMenu extends Component{

goNext = (path, mName, event, language) => {
    event["preventDefault"]();
    let tag = true;
    if (window["location"]["hash"]["split"]("/")["length"] > 1 && (window["location"]["hash"]["split"]("/")[1] != "" && window["location"]["hash"]["split"]("/")[1] != null) && mName == this["props"]["appName"]) {
        // tag = window["confirm"]('Are you sure you want to leave this page?');
        // tag = window["confirm"](MenuMsg[language]["MSG.ConfirmLeavePage"]);
    }
    if (tag) {
        let host = "";
        let port = !window.location.port ? "" : `:${window.location.port}`;
        let arr = path["split"]("@");
        let module = path;
        if (arr[0]) {
            module = arr[0];
        }
        if (arr[1]) {
            host = arr[1];
        }
        let param = this["getSession"]("ps");
        let loginid = "";
        let up = "";
        let platform = "";
        let ts = "";
        if (!this["isEmpty"](param)) {
            let parameters = this["getParameters"](decodeURIComponent(param));
            loginid = parameters["loginid"];
            up = parameters["up"];
            if (parameters["platform"]) {
                platform = parameters["platform"];
            }
            ts = parameters["ts"];
        }
        if (module["substring"](0, 3) == "H5_") {
            let pl = [];
            pl = module["split"]("_");
            if (pl[1] && pl[1] == this["props"]["appName"]) {
                this["props"]["history"]["push"]({
                    pathname: '/' + module
                });
            } else if (pl[1]) {
                let h5URL = this["props"]["url"];
                if (!this["isEmpty"](host) && host != window["location"]["hostname"]) {
                    h5URL = this["replaceHost"](h5URL, host, port);
                    //window["location"]["href"] = this["replaceHost"](h5URL, host, port) + "iHousingH5/index.html?ps=" + this["getSession"]("ps") + "&moduleName=" + module;
                    window["location"]["href"] = h5URL + pl[1] + '/#/' + module + "?ps=" + this["getSession"]("ps");
                } 
                else {
                    window["location"]["href"] = h5URL + pl[1] + '/#/' + module ;
                }
                

            } else {
                this["props"]["history"]["push"]({
                    pathname: '/' + module
                });
            }
        } else {
            let h5ToFlexURL = this["props"]["iHousingURL"];
            let ps = encodeSessionSecret(loginid, up);
            if (!this["isEmpty"](host) && host != window["location"]["hostname"]) {
                h5ToFlexURL = this["replaceHost"](h5ToFlexURL, host, port);
            }
            window["location"]["href"] = h5ToFlexURL + "?ps=" + ps + "&moduleName=" + module;
        }
    }
    $(".yyui_menu li")["children"]("ul")["hide"]();
};
getSession = name => {
    let value = sessionStorage[name];
    if (value == null || value == undefined) return null;
    if (value["indexOf"]("{") >= 0) {
        value = JSON["parse"](value);
    }
    return value;
};
saveSession = (name, value) => {
    if (typeof (value) == "object") {
        value = JSON["stringify"](value);
    }
    sessionStorage[name] = value;
};
isEmpty = str => {
    if (str == undefined || str == null || str == "null" || str["length"] == 0 || str == "undefined") return true;
    return false;
};
getParameters = (str) => {
    let paramsStr = "";
    if (str != null && str != "") {
        paramsStr = this["rDecode"](str);
    } else {
        return null
    }
    let arr = paramsStr["split"]('&');
    let params = {};
    for (let i = 0; i < arr["length"]; i++) {
        let data = arr[i]["split"]('=');
        if (data["length"] === 2) {
            params[data[0]] = data[1];
        }
    }
    return params;
};
rDecode = (text, time) => {
    let R = new window["String"]();
    R = this["r_n"](text, "!\"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~");
    return R;
};
r_n = (text, map) => {
    let R = new window["String"]();
    let i, j, c, len = map["length"];
    for (i = 0; i < text["length"]; i++) {
        c = text["charAt"](i);
        j = map["indexOf"](c);
        if (j >= 0) {
            c = map["charAt"]((j + len / 2) % len);
        }
        R = R + c;
    }
    return R;
};
// For non-empty port parameter, port should begin with ":"
replaceHost = (url, host, port) => {
    console.log('Original url: ' + url);
    if (url.indexOf("//") != -1 && url.substring(url.indexOf("//") + 2).indexOf('/') != -1) {
        let path = url.substring(url.substring(window.location.protocol.length + 2).indexOf("/") + window.location.protocol.length + 2);
        return url.substring(0, url.indexOf('//')) + "//" + host + (port ?? '') + path;
    }
    console.log('Original url is not in expected format');
    return url;
}
componentDidMount() {
    $(window["document"])["ready"](function () {
        $(".yyui_menu li ul li")["hover"](function () {
            $(this)["siblings"]()["children"]("ul")["hide"]();
            $(this)["children"]("ul")["show"]();
        });
        $(".yyui_menu li")["click"](function (Hs$1) {
            $(".yyui_menu li ul")["hide"]();
            $(this)["children"]("ul")["show"]();
        });
    });
};

    
    render(){
        let menu = this.props.menu;
        let mName = this.props.mName;
        let history = this.props.history;
        let url = this.props.url;
        let iHousingURL = this.props.iHousingURL;
        let appName = this.props.appName;
        let language = this.props.language;
        
        if(menu.menuitem.submenus && menu.menuitem.submenus.length>0){
            const list=[];
            menu.menuitem.submenus.forEach((item)=>{
                list.push  (<DropMenu menu={item} mName={mName} iHousingURL={iHousingURL} 
                    appName={appName} url={url} history={history} 
                    key = {item.menuitem.id} language= {language} />);
            })
            return(
                <li key={menu.menuitem.id} >
                    <a className="Dropdown-option">{menu.menuitem.label}</a>
                    <ul className="Dropdown-menu">
                        {list}
                    </ul>
                    <span className="Dropdown-arrow2"></span>
                </li>
            )
        }else{
            return(
                <li key={menu.menuitem.id}   onClick={this.goNext.bind(this,menu.menuitem.moduleName,mName)}>
                    <a className="Dropdown-option"  >{menu.menuitem.label}</a>
                </li>
            )
        }
        
    }

};


export default DropMenu;
