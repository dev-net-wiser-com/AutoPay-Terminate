package com.hkhs.hmms.soap;

import jakarta.jws.WebService;
import com.hkhs.hmms.autopay.AutopayTermService;

@WebService(serviceName="AutopayTermService", portName="AutopayTermServiceHttpSoap11Endpoint", targetNamespace="http://pps.hmms.hkhs.com", endpointInterface="com.hkhs.hmms.soap.AutopayTermServiceApi")
public class AutopaySoapEndpoint implements AutopayTermServiceApi {
    @Override
    public String getPaymentReference(String propertyRef) {
        return new AutopayTermService().getPaymentReference(propertyRef);
    }

    @Override
    public String checkPropertyRef(String propertyRef) {
        return new AutopayTermService().checkPropertyRef(propertyRef);
    }

    @Override
    public String getAvailableEstates(String loginID) {
        return new AutopayTermService().getAvailableEstates(loginID);
    }

    @Override
    public String lookupTenancyName(String propertyRef) {
        return new AutopayTermService().lookupTenancyName(propertyRef);
    }

    @Override
    public String lookupTenancyNameLang(String propertyRef, String language) {
        return new AutopayTermService().lookupTenancyNameLang(propertyRef, language);
    }

    @Override
    public String validateLine(String lineInputs, String screenId, String refId) {
        return new AutopayTermService().validateLine(lineInputs, screenId, refId);
    }

    @Override
    public String saveScreen(String screenInputs, String screenId, String loginID) {
        return new AutopayTermService().saveScreen(screenInputs, screenId, loginID);
    }

    @Override
    public String saveScreenLang(String screenInputs, String screenId, String loginID, String language) {
        return new AutopayTermService().saveScreenLang(screenInputs, screenId, loginID, language);
    }

    @Override
    public String inTake(String uploadDate, String screenId, String refId) {
        return new AutopayTermService().inTake(uploadDate, screenId, refId);
    }

    @Override
    public String inTakeLang(String uploadDate, String screenId, String refId, String language) {
        return new AutopayTermService().inTakeLang(uploadDate, screenId, refId, language);
    }

    @Override
    public String fetchUploadPath() {
        return new AutopayTermService().fetchUploadPath();
    }

    @Override
    public String lookupUploadLog(String date) {
        return new AutopayTermService().lookupUploadLog(date);
    }

    @Override
    public String newUploadLog(String fileName, String thru, String uploadBy, String status, String atdID) {
        return new AutopayTermService().newUploadLog(fileName, thru, uploadBy, status, atdID);
    }

    @Override
    public String deleteUploadLog(String ppsID) {
        return new AutopayTermService().deleteUploadLog(ppsID);
    }

    @Override
    public String GetValueDate() {
        return new AutopayTermService().GetValueDate();
    }

    @Override
    public String getUploadDetailMessage(String aptId, String includeCorrect) {
        return new AutopayTermService().getUploadDetailMessage(aptId, includeCorrect);
    }

}
