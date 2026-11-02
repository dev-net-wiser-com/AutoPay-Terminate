// HTML5-Base template 2022.03.30
import React from 'react';
import {Route,Switch} from 'react-router';
import Home from '../view/Home';
import ErrorPage from '../view/ErrorPage';
import AutopayTerminateInput from '../view/AutopayTerminateInput';
import AutopayTerminateUpload from '../view/AutopayTerminateUpload';
// HTML5-Base template: import module specific views
// import WTPEnquiry from '../view/WTPEnquiry';
// import WTPEnquiry from '../view/WTPEnquiry';
// HTML5-Base template End: import module specific views


const MainRoutes = () => {
    return(
        <Switch>
            <Route exact path="/" component={Home} />
            <Route path="/iHousing_home" component={Home} />
            <Route path="/error" component={ErrorPage} />
            {/* HTML5-Base template: module specific paths */}
            <Route exact path="/H5_autopay_terminateInput" component={AutopayTerminateInput} />            
            <Route exact path="/H5_autopay_terminateUpload" component={AutopayTerminateUpload} />            
            {/* HTML5-Base template End: module specific paths */}
     
        </Switch>
    )
}

export default MainRoutes;
