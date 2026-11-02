package com.hkhs.hmms.soap;

import jakarta.jws.WebService;
import jakarta.jws.WebMethod;
import jakarta.jws.WebParam;
import jakarta.jws.WebResult;

@WebService(name="AutopayTermServicePortType", targetNamespace="http://pps.hmms.hkhs.com")
public interface AutopayTermServiceApi {
    @WebMethod(operationName="getPaymentReference", action="getPaymentReference")
    @WebResult(name="return", targetNamespace="http://pps.hmms.hkhs.com")
    String getPaymentReference(@WebParam(name="propertyRef", targetNamespace="http://pps.hmms.hkhs.com") String propertyRef);

    @WebMethod(operationName="checkPropertyRef", action="checkPropertyRef")
    @WebResult(name="return", targetNamespace="http://pps.hmms.hkhs.com")
    String checkPropertyRef(@WebParam(name="propertyRef", targetNamespace="http://pps.hmms.hkhs.com") String propertyRef);

    @WebMethod(operationName="getAvailableEstates", action="getAvailableEstates")
    @WebResult(name="return", targetNamespace="http://pps.hmms.hkhs.com")
    String getAvailableEstates(@WebParam(name="loginID", targetNamespace="http://pps.hmms.hkhs.com") String loginID);

    @WebMethod(operationName="lookupTenancyName", action="lookupTenancyName")
    @WebResult(name="return", targetNamespace="http://pps.hmms.hkhs.com")
    String lookupTenancyName(@WebParam(name="propertyRef", targetNamespace="http://pps.hmms.hkhs.com") String propertyRef);

    @WebMethod(operationName="lookupTenancyNameLang", action="lookupTenancyNameLang")
    @WebResult(name="return", targetNamespace="http://pps.hmms.hkhs.com")
    String lookupTenancyNameLang(@WebParam(name="propertyRef", targetNamespace="http://pps.hmms.hkhs.com") String propertyRef, @WebParam(name="language", targetNamespace="http://pps.hmms.hkhs.com") String language);

    @WebMethod(operationName="validateLine", action="validateLine")
    @WebResult(name="return", targetNamespace="http://pps.hmms.hkhs.com")
    String validateLine(@WebParam(name="lineInputs", targetNamespace="http://pps.hmms.hkhs.com") String lineInputs, @WebParam(name="screenId", targetNamespace="http://pps.hmms.hkhs.com") String screenId, @WebParam(name="refId", targetNamespace="http://pps.hmms.hkhs.com") String refId);

    @WebMethod(operationName="saveScreen", action="saveScreen")
    @WebResult(name="return", targetNamespace="http://pps.hmms.hkhs.com")
    String saveScreen(@WebParam(name="screenInputs", targetNamespace="http://pps.hmms.hkhs.com") String screenInputs, @WebParam(name="screenId", targetNamespace="http://pps.hmms.hkhs.com") String screenId, @WebParam(name="loginID", targetNamespace="http://pps.hmms.hkhs.com") String loginID);

    @WebMethod(operationName="saveScreenLang", action="saveScreenLang")
    @WebResult(name="return", targetNamespace="http://pps.hmms.hkhs.com")
    String saveScreenLang(@WebParam(name="screenInputs", targetNamespace="http://pps.hmms.hkhs.com") String screenInputs, @WebParam(name="screenId", targetNamespace="http://pps.hmms.hkhs.com") String screenId, @WebParam(name="loginID", targetNamespace="http://pps.hmms.hkhs.com") String loginID, @WebParam(name="language", targetNamespace="http://pps.hmms.hkhs.com") String language);

    @WebMethod(operationName="inTake", action="inTake")
    @WebResult(name="return", targetNamespace="http://pps.hmms.hkhs.com")
    String inTake(@WebParam(name="uploadDate", targetNamespace="http://pps.hmms.hkhs.com") String uploadDate, @WebParam(name="screenId", targetNamespace="http://pps.hmms.hkhs.com") String screenId, @WebParam(name="refId", targetNamespace="http://pps.hmms.hkhs.com") String refId);

    @WebMethod(operationName="inTakeLang", action="inTakeLang")
    @WebResult(name="return", targetNamespace="http://pps.hmms.hkhs.com")
    String inTakeLang(@WebParam(name="uploadDate", targetNamespace="http://pps.hmms.hkhs.com") String uploadDate, @WebParam(name="screenId", targetNamespace="http://pps.hmms.hkhs.com") String screenId, @WebParam(name="refId", targetNamespace="http://pps.hmms.hkhs.com") String refId, @WebParam(name="language", targetNamespace="http://pps.hmms.hkhs.com") String language);

    @WebMethod(operationName="fetchUploadPath", action="fetchUploadPath")
    @WebResult(name="return", targetNamespace="http://pps.hmms.hkhs.com")
    String fetchUploadPath();

    @WebMethod(operationName="lookupUploadLog", action="lookupUploadLog")
    @WebResult(name="return", targetNamespace="http://pps.hmms.hkhs.com")
    String lookupUploadLog(@WebParam(name="date", targetNamespace="http://pps.hmms.hkhs.com") String date);

    @WebMethod(operationName="newUploadLog", action="newUploadLog")
    @WebResult(name="return", targetNamespace="http://pps.hmms.hkhs.com")
    String newUploadLog(@WebParam(name="fileName", targetNamespace="http://pps.hmms.hkhs.com") String fileName, @WebParam(name="thru", targetNamespace="http://pps.hmms.hkhs.com") String thru, @WebParam(name="uploadBy", targetNamespace="http://pps.hmms.hkhs.com") String uploadBy, @WebParam(name="status", targetNamespace="http://pps.hmms.hkhs.com") String status, @WebParam(name="atdID", targetNamespace="http://pps.hmms.hkhs.com") String atdID);

    @WebMethod(operationName="deleteUploadLog", action="deleteUploadLog")
    @WebResult(name="return", targetNamespace="http://pps.hmms.hkhs.com")
    String deleteUploadLog(@WebParam(name="ppsID", targetNamespace="http://pps.hmms.hkhs.com") String ppsID);

    @WebMethod(operationName="GetValueDate", action="GetValueDate")
    @WebResult(name="return", targetNamespace="http://pps.hmms.hkhs.com")
    String GetValueDate();

    @WebMethod(operationName="getUploadDetailMessage", action="getUploadDetailMessage")
    @WebResult(name="return", targetNamespace="http://pps.hmms.hkhs.com")
    String getUploadDetailMessage(@WebParam(name="aptId", targetNamespace="http://pps.hmms.hkhs.com") String aptId, @WebParam(name="includeCorrect", targetNamespace="http://pps.hmms.hkhs.com") String includeCorrect);

}
