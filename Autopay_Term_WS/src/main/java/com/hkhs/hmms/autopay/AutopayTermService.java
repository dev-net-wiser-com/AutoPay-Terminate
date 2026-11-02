package com.hkhs.hmms.autopay;

import java.io.BufferedReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Savepoint;
import java.sql.Types;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.ResolverStyle;
import java.util.ArrayList;
import java.util.List;
import com.hkhs.hmms.netwiser.Configuration;
import com.hkhs.hmms.netwiser.DBConnection;
import com.hkhs.hmms.netwiser.JsonUtils;
import com.hkhs.hmms.netwiser.AutopayStoragePaths;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/** AutoPay-only business service. A fresh instance is created for every SOAP call. */
public class AutopayTermService {
    private static final Logger LOG = LoggerFactory.getLogger(AutopayTermService.class);
    private static final DateTimeFormatter DATE = DateTimeFormatter.ofPattern("dd/MM/uuuu").withResolverStyle(ResolverStyle.STRICT);
    private static final String ACCESS = "SELECT AUN_CODE FROM HSV_MIS_USER_ESTATE " +
        "WHERE UAU_USR_USERNAME=UPPER(?) AND AUN_CODE=(SELECT HSA_ESTCODE FROM HSV_ALLPROPERTIES_BASE WHERE PRO_PROPREF=?)";
private final static String SQL_GET_UPLOAD_LOG =
			" SELECT APT_ID, APT_UPLOAD_THRU as APT_FILE_KIND, APT_FILE_NAME, \n"
			+ " DECODE (SIGN(INSTR(APT_PROCESS_STATUS,'UPLOAD_')),0,APT_PROCESS_STATUS,1,"
			+ " APT_PROCESS_STATUS,'SUCCESS') as UPLOAD_STATUS, \n"
			+ " APT_PROCESS_STATUS,APT_PROCESS_MESS,ATD_ID, APT_UPLOAD_BY, "
			+ " to_char(APT_UPLOAD_TIME, 'dd/mm/yyyy') as UPLOAD_DATE, APT_TOTAL, APT_SUCCESS, \n"
			+ " nvl(APT_TOTAL,0)-nvl(APT_SUCCESS,0) ERROR_CNT,\n"
			+ " (select APTD_PROCESS_MESS from \n"
			+ " 		 HST_AUTOPAY_TERM_DETAIL_LOG \n"
			+ " 		 where APT_ID=HST_AUTOPAY_TERM_LOG.APT_ID and \n"
			+ " 		 APTD_ID= (select MIN(APTD_ID) from HST_AUTOPAY_TERM_DETAIL_LOG where APT_ID=HST_AUTOPAY_TERM_LOG.APT_ID and APTD_STATUS='FAIL') ) FIRST_ERROR \n"
			+ " FROM HST_AUTOPAY_TERM_LOG "
			+ " WHERE APT_UPLOAD_THRU<>'S' AND APT_UPLOAD_TIME between trunc(SYSDATE)-30 and ?+0.99 order by APT_UPLOAD_TIME DESC \n";
private final static String SQL_INSERT_UPLOAD_LOG
	        = " INSERT INTO HST_AUTOPAY_TERM_LOG (APT_ID, APT_UPLOAD_THRU, APT_FILE_NAME, "
			+ " APT_UPLOAD_BY, APT_UPLOAD_TIME, "
			+ " APT_PROCESS_STATUS,APT_PROCESS_MESS, ATD_ID) "
			+ " VALUES (SEQ_AUTOPAY_TERM_LOG.nextval, ?, ?, ?, SYSDATE, ?, ?, ?)  ";
private final static String SQL_INSERT_UPLOAD_LOG_SCREEN
    = " INSERT INTO HST_AUTOPAY_TERM_LOG (APT_ID, APT_UPLOAD_THRU, APT_FILE_NAME, "
	+ " APT_UPLOAD_BY, APT_UPLOAD_TIME, "
	+ " APT_PROCESS_STATUS,APT_PROCESS_MESS, ATD_ID) "
	+ " VALUES (?, ?, ?, ?, SYSDATE, ?, ?, ?)  ";
private final static String SQL_GEN_APT_ID ="SELECT SEQ_AUTOPAY_TERM_LOG.nextval from dual";
private final static String SQL_INSERT_UPLOAD_DETAIL_LOG
    = " INSERT INTO HST_AUTOPAY_TERM_DETAIL_LOG ( APTD_ID, APT_ID, APTD_CREDIT_BANK_AC, APTD_DEBIT_BANK_AC," +
	    " APTD_BANK_AC_NAME, APTD_DEBITOR_REF, APTD_TERM_EFFECT_DATE ,  " +
	    " APTD_PROPERTY_REF, APTD_TENANCY_NAME, APTD_PROCESS_MESS, APTD_STATUS) " +
		" VALUES (SEQ_AUTOPAY_TERM_DETAIL_LOG.nextval, ?, ?, ?, " +
		" ?, ?, ?, " +
		" ?, ?, ?, ? )  ";
private final static String SQL_GET_REAL_FILE_NAME = " SELECT ATD_FILE_SYS_NAME  \n"
			+ " FROM HST_HMMS_ATTACHMENT_DETAIL  " + " WHERE ATD_ID=? \n";
private final static String SQL_GET_UPLOAD_PATH =
			"SELECT HSK_HMMS_GEN.getJbossUploadPath FROM DUAL ";
private final static String SQL_GET_UPLOAD_ERROR_MESS =
			"SELECT APTD_ID,trim(NVL(APTD_PROCESS_MESS,'')) as APTD_PROCESS_MESS ," +
			" trim(NVL(APTD_STATUS,'')) as APTD_STATUS," +
			" trim(NVL(APTD_DEBITOR_REF,'')) as APTD_DEBITOR_REF " +
			" FROM HST_AUTOPAY_TERM_DETAIL_LOG  " +
			" WHERE APT_ID=? " +
			" ORDER BY APTD_ID ";

    // Preserve old public stubs for WSDL compatibility; the current frontend does not call them.
    public String getPaymentReference(String propertyRef) { return ""; }
    public String checkPropertyRef(String propertyRef) { return ""; }
    public String validateLine(String lineInputs, String screenId, String refId) { return ""; }

    private static String languageID(String language) {
        return language != null && language.toLowerCase(java.util.Locale.ROOT).startsWith("zh") ? "C" : "E";
    }
    private static String text(String value) { return value == null ? "" : value; }
    private static String required(String value, String name) {
        if (value == null || value.isBlank()) throw new IllegalArgumentException(name + " is required");
        return value.trim();
    }
    private static long id(String value) {
        long parsed = Long.parseLong(required(value, "ID"));
        if (parsed <= 0) throw new IllegalArgumentException("Invalid ID");
        return parsed;
    }
    private static Date date(String value) { return Date.valueOf(LocalDate.parse(required(value, "Date"), DATE)); }
    private static String failure(String operation, Exception error) {
        LOG.warn("{} failed", operation, error);
        return "Fail:" + operation + ": " + text(error.getMessage());
    }
    private static void access(Connection connection, String property, String user) throws SQLException {
        try (PreparedStatement statement = connection.prepareStatement(ACCESS)) {
            statement.setString(1, required(user, "Login ID")); statement.setString(2, required(property, "Property reference"));
            try (ResultSet rows = statement.executeQuery()) {
                if (!rows.next()) throw new SQLException("ERR11418");
            }
        }
    }
    private static void audit(Connection connection, String user) throws SQLException {
        try (CallableStatement statement = connection.prepareCall("{call FSC_VARIABLES.set_g_username(?)}")) {
            statement.setString(1, required(user, "Login ID")); statement.execute();
        }
    }
    private static void rollback(Connection connection, Exception error) {
        try { connection.rollback(); } catch (SQLException other) { error.addSuppressed(other); }
    }
    private static Date nextDate(Connection connection) throws SQLException {
        try (CallableStatement statement = connection.prepareCall("{? = call HSK_RAC.getNextDDTermDate()}")) {
            statement.registerOutParameter(1, Types.DATE); statement.execute();
            Date result = statement.getDate(1);
            if (result == null) throw new SQLException("No next termination date was returned");
            return result;
        }
    }
    public String GetValueDate() {
        try (Connection connection = DBConnection.getConnection()) { return nextDate(connection).toLocalDate().format(DATE); }
        catch (Exception error) { return failure("GetValueDate", error); }
    }
    public String getAvailableEstates(String loginID) {
        // The original empty crsDBUser prefix resolves CRS_USER_ESTATES through the current schema/synonyms.
        try (Connection connection = DBConnection.getConnection(); PreparedStatement statement = connection.prepareStatement(
                "SELECT UAUV_AUN_CODE FROM CRS_USER_ESTATES WHERE RTRIM(UAUV_USR_USERNAME)=?")) {
            statement.setString(1, required(loginID, "Login ID"));
            List<String> estates = new ArrayList<>();
            try (ResultSet rows = statement.executeQuery()) { while (rows.next()) estates.add(text(rows.getString(1))); }
            return String.join("`", estates);
        } catch (Exception error) { return failure("getAvailableEstates", error); }
    }
    public String lookupTenancyName(String propertyRef) { return lookupTenancyNameLang(propertyRef, "en_US"); }
    public String lookupTenancyNameLang(String propertyRef, String language) {
        try (Connection connection = DBConnection.getConnection()) {
            String[] fields = required(propertyRef, "Lookup input").split("`", -1);
            if (fields.length < 3) throw new IllegalArgumentException("Expected property, payment reference and login ID");
            access(connection, fields[0], fields[2]);
            double account;
            try (CallableStatement statement = connection.prepareCall("{? = call HSK_RAC.GetRacAccnoFromDDInput(?,?,?,?)}")) {
                statement.registerOutParameter(1, Types.VARCHAR);
                statement.setString(2, fields[0]); statement.setString(3, required(fields[1], "Payment reference"));
                statement.setString(4, languageID(language)); statement.registerOutParameter(5, Types.NUMERIC);
                statement.execute(); checkCode(statement.getString(1)); account = statement.getDouble(5);
                if (statement.wasNull()) throw new SQLException("No revenue account was returned");
            }
            try (CallableStatement statement = connection.prepareCall("{? = call HSK_RAC.GetAutopayDtls(?,?,?,?)}")) {
                statement.registerOutParameter(1, Types.VARCHAR); statement.setDouble(2, account);
                for (int position = 3; position <= 5; position++) statement.registerOutParameter(position, Types.VARCHAR);
                statement.execute(); checkCode(statement.getString(1));
                return text(statement.getString(3)) + "`" + text(statement.getString(4)) + "`" + text(statement.getString(5));
            }
        } catch (Exception error) { return failure("lookupTenancyNameLang", error); }
    }
    private static void checkCode(String code) throws SQLException {
        if (code != null && !code.isBlank()) throw new SQLException(code);
    }
    private static void validate(Connection connection, String propertyOrCredit, String bank, String payer,
            String reference, Date effective, String language) throws SQLException {
        // Eight PL/SQL arguments; JDBC position 1 is the function return value.
        try (CallableStatement statement = connection.prepareCall("{? = call HSK_RAC.ValidateAutopayTermEntry(?,?,?,?,?,?,?,?)}")) {
            statement.registerOutParameter(1, Types.VARCHAR);
            statement.setString(2, propertyOrCredit); statement.setString(3, bank); statement.setString(4, payer);
            statement.setString(5, reference); statement.setDate(6, effective);
            statement.setNull(7, Types.DATE); statement.setNull(8, Types.DATE); statement.setString(9, languageID(language));
            statement.execute(); checkCode(statement.getString(1));
        }
    }
    private static void terminate(Connection connection, String type, String reference, Date effective, String bank) throws SQLException {
        String sql = switch (type) {
            case "ALTREF" -> "{call HSK_RAC.EndAutoPay_by_AltRef(?,?,?)}";
            case "PAYREF" -> "{call HSK_RAC.EndAutoPay_by_PayRef(?,?,?)}";
            case "RAC" -> "{call HSK_RAC.EndAutoPay_by_Rac(?,?,?)}";
            default -> throw new IllegalArgumentException("Invalid account type");
        };
        try (CallableStatement statement = connection.prepareCall(sql)) {
            statement.setString(1, reference); statement.setDate(2, effective); statement.setString(3, bank); statement.execute();
        }
    }
    private record ScreenRow(String property, String reference, Date effective, String tenant, String payer, String bank) {}
    private static List<ScreenRow> screenRows(String input) {
        List<ScreenRow> result = new ArrayList<>();
        for (String line : required(input, "Screen input").split("\\^")) {
            String[] fields = line.split("`", -1);
            if (fields.length != 6) throw new IllegalArgumentException("Expected six fields in every screen row");
            result.add(new ScreenRow(required(fields[0], "Property"), required(fields[1], "Payment reference"), date(fields[2]),
                fields[3], required(fields[4], "Payer name"), required(fields[5], "Bank account")));
        }
        return result;
    }
    public String saveScreen(String screenInputs, String screenId, String loginID) {
        return saveScreenLang(screenInputs, screenId, loginID, "en_US");
    }
    public String saveScreenLang(String screenInputs, String screenId, String loginID, String language) {
        try {
            required(screenId, "Screen ID"); required(loginID, "Login ID");
            List<ScreenRow> input = screenRows(screenInputs);
            try (Connection connection = DBConnection.getConnection()) {
                connection.setAutoCommit(false);
                try {
                    audit(connection, loginID);
                    for (ScreenRow row : input) {
                        access(connection, row.property(), loginID);
                        validate(connection, row.property(), row.bank(), row.payer(), row.reference(), row.effective(), language);
                    }
                    String aptId;
                    try (PreparedStatement statement = connection.prepareStatement(SQL_GEN_APT_ID); ResultSet rows = statement.executeQuery()) {
                        if (!rows.next()) throw new SQLException("No termination log ID was returned");
                        aptId = rows.getString(1);
                    }
                    try (PreparedStatement statement = connection.prepareStatement(SQL_INSERT_UPLOAD_LOG_SCREEN)) {
                        statement.setString(1, aptId); statement.setString(2, "S"); statement.setString(3, "SCREEN INPUT");
                        statement.setString(4, loginID); statement.setString(5, "NEW");
                        statement.setNull(6, Types.VARCHAR); statement.setNull(7, Types.NUMERIC); statement.executeUpdate();
                    }
                    for (ScreenRow row : input) {
                        terminate(connection, "PAYREF", row.reference(), row.effective(), row.bank());
                        UploadDetailClass detail = new UploadDetailClass();
                        detail.setCreditAC(""); detail.setBankAC(row.bank()); detail.setAcName(row.payer()); detail.setDebitRef(row.reference());
                        detail.setEffectDate(row.effective()); detail.setPropertyRef(row.property()); detail.setTenantName(row.tenant());
                        detail.setStatus("SUCCESS"); detail.setMessage(""); insertDetail(connection, aptId, detail);
                    }
                    updateLog(connection, aptId, "SUCCESS", "", input.size(), input.size());
                    connection.commit(); return Integer.toString(input.size());
                } catch (Exception error) { rollback(connection, error); throw error; }
            }
        } catch (Exception error) { return failure("saveScreenLang", error); }
    }
    private static void insertDetail(Connection connection, String aptId, UploadDetailClass detail) throws SQLException {
        try (PreparedStatement statement = connection.prepareStatement(SQL_INSERT_UPLOAD_DETAIL_LOG)) {
            statement.setLong(1, id(aptId)); statement.setString(2, detail.getCreditAC()); statement.setString(3, detail.getBankAC());
            statement.setString(4, detail.getAcName()); statement.setString(5, detail.getDebitRef()); statement.setDate(6, detail.getEffectDate());
            statement.setString(7, detail.getPropertyRef()); statement.setString(8, detail.getTenantName());
            statement.setString(9, limit(text(detail.getMessage()), 200)); statement.setString(10, detail.getStatus()); statement.executeUpdate();
        }
    }
    private static String limit(String value, int count) { return value.length() <= count ? value : value.substring(0, count); }
    private static void updateLog(Connection connection, String aptId, String status, String message, int total, int success) throws SQLException {
        try (PreparedStatement statement = connection.prepareStatement("UPDATE HST_AUTOPAY_TERM_LOG SET APT_PROCESS_STATUS=?, " +
                "APT_PROCESS_MESS=?, APT_TOTAL=?, APT_SUCCESS=? WHERE APT_ID=?")) {
            statement.setString(1, status); statement.setString(2, limit(text(message), 200));
            statement.setInt(3, total); statement.setInt(4, success); statement.setLong(5, id(aptId)); statement.executeUpdate();
        }
    }
    public String lookupUploadLog(String date) {
        try (Connection connection = DBConnection.getConnection(); PreparedStatement statement = connection.prepareStatement(SQL_GET_UPLOAD_LOG)) {
            statement.setDate(1, date(date)); List<APTUploadLogClass> result = new ArrayList<>();
            try (ResultSet rows = statement.executeQuery()) {
                while (rows.next()) {
                    APTUploadLogClass item = new APTUploadLogClass();
                    item.setId(rows.getString("APT_ID")); item.setFileKind(rows.getString("APT_FILE_KIND")); item.setFileName(rows.getString("APT_FILE_NAME"));
                    item.setUploadStatus(rows.getString("UPLOAD_STATUS")); item.setProcessStatus(rows.getString("APT_PROCESS_STATUS"));
                    item.setAtdId(rows.getString("ATD_ID")); item.setUploadBy(rows.getString("APT_UPLOAD_BY")); item.setUploadTime(rows.getString("UPLOAD_DATE"));
                    int total = rows.getInt("APT_TOTAL"), success = rows.getInt("APT_SUCCESS"), errors = total - success;
                    item.setTotal(Integer.toString(total)); item.setSuccess(Integer.toString(success)); item.setFail(Integer.toString(errors));
                    item.setProcessMess(errors == 0 ? text(rows.getString("APT_PROCESS_MESS")) : errors > 1 ? "Click here for error details" : rows.getString("FIRST_ERROR"));
                    result.add(item);
                }
            }
            return JsonUtils.toJsonArray(result).toString();
        } catch (Exception error) { return failure("lookupUploadLog", error); }
    }
    public String getUploadDetailMessage(String aptId, String includeCorrect) {
        try (Connection connection = DBConnection.getConnection(); PreparedStatement statement = connection.prepareStatement(SQL_GET_UPLOAD_ERROR_MESS)) {
            statement.setLong(1, id(aptId)); List<UploadFileDetailMessage> result = new ArrayList<>();
            try (ResultSet rows = statement.executeQuery()) {
                int line = 0;
                while (rows.next()) {
                    line++; boolean success = "SUCCESS".equals(rows.getString("APTD_STATUS"));
                    if (success && !"Y".equals(includeCorrect)) continue;
                    UploadFileDetailMessage item = new UploadFileDetailMessage(); item.setPayref(rows.getString("APTD_DEBITOR_REF"));
                    String message = text(rows.getString("APTD_PROCESS_MESS")); int colon = message.indexOf(':');
                    item.setLineNo(message.startsWith("line ") && colon > 0 ? message.substring(0, colon) : Integer.toString(line));
                    item.setCode(colon > 0 ? message.substring(colon + 1).trim() : message); result.add(item);
                }
            }
            return JsonUtils.toJsonArray(result).toString();
        } catch (Exception error) { return failure("getUploadDetailMessage", error); }
    }
    public String newUploadLog(String fileName, String thru, String uploadBy, String status, String atdID) {
        try {
            AutopayStoragePaths.filename(fileName); required(uploadBy, "Login ID");
            if (!"D".equals(thru) || !"UPLOAD_SUCCESS".equals(status)) throw new IllegalArgumentException("Invalid upload log state");
            try (Connection connection = DBConnection.getConnection()) {
                connection.setAutoCommit(false);
                try (PreparedStatement statement = connection.prepareStatement(SQL_INSERT_UPLOAD_LOG)) {
                    statement.setString(1, thru); statement.setString(2, fileName); statement.setString(3, uploadBy);
                    statement.setString(4, status); statement.setNull(5, Types.VARCHAR); statement.setLong(6, id(atdID));
                    statement.executeUpdate(); connection.commit(); return "";
                } catch (Exception error) { rollback(connection, error); throw error; }
            }
        } catch (Exception error) { return failure("newUploadLog", error); }
    }
    public String deleteUploadLog(String ppsID) {
        try (Connection connection = DBConnection.getConnection()) {
            connection.setAutoCommit(false);
            try (PreparedStatement statement = connection.prepareStatement(
                    "DELETE FROM HST_AUTOPAY_TERM_LOG WHERE APT_ID=? AND APT_PROCESS_STATUS='UPLOAD_SUCCESS'")) {
                statement.setLong(1, id(ppsID));
                if (statement.executeUpdate() != 1) throw new SQLException("Upload log is absent or has already been processed");
                connection.commit(); return "";
            } catch (Exception error) { rollback(connection, error); throw error; }
        } catch (Exception error) { return failure("deleteUploadLog", error); }
    }
    private static String uploadRoot(Connection connection) throws SQLException {
        String configured = Configuration.autopayUploadRoot();
        if (!configured.isEmpty()) return AutopayStoragePaths.rootDirectory(configured);
        try (PreparedStatement statement = connection.prepareStatement(SQL_GET_UPLOAD_PATH); ResultSet rows = statement.executeQuery()) {
            if (!rows.next()) throw new SQLException("No upload path was returned");
            String value = required(rows.getString(1), "Database upload path");
            return value.contains("$") ? value : AutopayStoragePaths.rootDirectory(value);
        }
    }
    public String fetchUploadPath() {
        try {
            String configured = Configuration.autopayUploadRoot();
            if (!configured.isEmpty()) return AutopayStoragePaths.rootDirectory(configured);
            try (Connection connection = DBConnection.getConnection()) { return uploadRoot(connection); }
        } catch (Exception error) { return failure("fetchUploadPath", error); }
    }
    private Path processingFile(Connection connection, String storedName, String screenId, String refId) throws java.io.IOException, SQLException {
        String configured = Configuration.autopayProcessingRoot(); String directory;
        if (!configured.isEmpty()) directory = AutopayStoragePaths.moduleDirectory(configured, screenId, refId);
        else {
            try {
                // Reuse the file transaction connection; never borrow a second pool slot while holding its row lock.
                String uploaded = uploadRoot(connection);
                directory = uploaded.contains("$") ? uploaded.replace("$", "") : AutopayStoragePaths.moduleDirectory(uploaded, screenId, refId);
            } catch (Exception rootError) {
                directory = new Configuration("/upload.properties").getValue("file.path");
                if (directory.isBlank()) throw new SQLException("No processing directory is configured", rootError);
            }
        }
        return AutopayStoragePaths.resolveFile(directory, storedName);
    }
    public String inTake(String uploadDate, String screenId, String refId) { return inTakeLang(uploadDate, screenId, refId, "en_US"); }
    public String inTakeLang(String uploadDate, String screenId, String refId, String language) {
        try {
            date(uploadDate);
            if (!"D.APT001".equals(screenId) || !"TOKEN_BR".equals(refId)) throw new IllegalArgumentException("Invalid AutoPay module directory");
            List<String> pending = new ArrayList<>();
            try (Connection connection = DBConnection.getConnection(); PreparedStatement statement = connection.prepareStatement(
                    "SELECT APT_ID FROM HST_AUTOPAY_TERM_LOG WHERE APT_UPLOAD_THRU<>'S' " +
                    "AND APT_UPLOAD_TIME BETWEEN TRUNC(SYSDATE)-30 AND SYSDATE AND APT_PROCESS_STATUS='UPLOAD_SUCCESS' " +
                    "ORDER BY APT_UPLOAD_TIME DESC, APT_FILE_NAME"); ResultSet rows = statement.executeQuery()) {
                while (rows.next()) pending.add(rows.getString(1));
            }
            int count = 0;
            for (String aptId : pending) if (processFile(aptId, screenId, refId, language)) count++;
            return Integer.toString(count);
        } catch (Exception error) { return failure("inTakeLang", error); }
    }
    private boolean processFile(String aptId, String screenId, String refId, String language) throws Exception {
        try (Connection connection = DBConnection.getConnection()) {
            connection.setAutoCommit(false);
            String attachmentId, uploadBy;
            try (PreparedStatement statement = connection.prepareStatement("SELECT ATD_ID, APT_UPLOAD_BY FROM HST_AUTOPAY_TERM_LOG " +
                    "WHERE APT_ID=? AND APT_PROCESS_STATUS='UPLOAD_SUCCESS' FOR UPDATE SKIP LOCKED")) {
                statement.setLong(1, id(aptId));
                try (ResultSet rows = statement.executeQuery()) {
                    if (!rows.next()) { connection.rollback(); return false; }
                    attachmentId = rows.getString(1); uploadBy = rows.getString(2);
                }
            }
            // Keep the master-row lock while rolling back failed file work.
            Savepoint fileStart = connection.setSavepoint("AUTOPAY_FILE");
            int total = 0, succeeded = 0;
            try {
                audit(connection, uploadBy); Date effective = nextDate(connection); String storedName;
                try (PreparedStatement statement = connection.prepareStatement(SQL_GET_REAL_FILE_NAME)) {
                    statement.setLong(1, id(attachmentId));
                    try (ResultSet rows = statement.executeQuery()) {
                        if (!rows.next()) throw new SQLException("Attachment record is missing");
                        storedName = rows.getString(1);
                    }
                }
                Path file = processingFile(connection, storedName, screenId, refId);
                try (BufferedReader reader = Files.newBufferedReader(file, Configuration.fileCharset())) {
                    String line; int physicalLine = 0;
                    while ((line = reader.readLine()) != null) {
                        physicalLine++; if (line.isBlank()) continue; total++;
                        Savepoint rowStart = connection.setSavepoint("AUTOPAY_LINE");
                        UploadDetailClass detail = new UploadDetailClass(); detail.setEffectDate(effective);
                        try {
                            String parsed;
                            try (CallableStatement statement = connection.prepareCall("{call HSK_RAC.ParseAutoPayLine(?,?)}")) {
                                statement.setString(1, line); statement.registerOutParameter(2, Types.VARCHAR); statement.execute(); parsed = statement.getString(2);
                            }
                            String[] fields = text(parsed).split("`", -1);
                            if (fields.length != 4) throw new SQLException("Invalid AutoPay file line");
                            detail.setCreditAC(fields[0]); detail.setBankAC(fields[1]); detail.setAcName(fields[2]); detail.setDebitRef(fields[3]);
                            validate(connection, fields[0], fields[1], fields[2], fields[3], effective, language);
                            String type;
                            try (CallableStatement statement = connection.prepareCall("{? = call HSK_RAC.IsAltRef(?)}")) {
                                statement.registerOutParameter(1, Types.VARCHAR); statement.setString(2, fields[3]); statement.execute();
                                String flag = statement.getString(1); type = "Y".equals(flag) ? "ALTREF" : "N".equals(flag) ? "PAYREF" : "RAC";
                            }
                            terminate(connection, type, fields[3], effective, fields[1]);
                            detail.setStatus("SUCCESS"); detail.setMessage(""); succeeded++;
                        } catch (Exception rowError) {
                            connection.rollback(rowStart); detail.setStatus("FAIL");
                            detail.setMessage("line " + physicalLine + ": " + text(rowError.getMessage()));
                            LOG.warn("AutoPay log {} line {} failed", aptId, physicalLine, rowError);
                        }
                        insertDetail(connection, aptId, detail);
                    }
                }
                String status = total == 0 ? "EMPTY" : succeeded == total ? "SUCCESS" : succeeded == 0 ? "FAIL" : "PARTIAL";
                updateLog(connection, aptId, status, succeeded == total ? "" : "See line details", total, succeeded);
                connection.commit(); return true;
            } catch (Exception fileError) {
                try {
                    connection.rollback(fileStart);
                    updateLog(connection, aptId, "PROCESS_FAIL", text(fileError.getMessage()), total, 0);
                    connection.commit();
                } catch (Exception updateError) { fileError.addSuppressed(updateError); rollback(connection, fileError); }
                throw fileError;
            }
        }
    }

	public static class APTUploadLogClass {

		String id;
		String fileKind;
		String fileName;
		String valueDate;
		String uploadStatus;
		String uploadTime;
		String uploadBy;
		String processStatus;
		String processMess;
		String atdId;
		String total;
		String success;
		String fail;

		public String getId() {
			return id;
		}

		public void setId(String id) {
			this.id = id;
		}

		public String getFileKind() {
			return fileKind;
		}

		public void setFileKind(String fileKind) {
			this.fileKind = fileKind;
		}

		public String getFileName() {
			return fileName;
		}

		public void setFileName(String fileName) {
			this.fileName = fileName;
		}

		public String getValueDate() {
			return valueDate;
		}

		public void setValueDate(String valueDate) {
			this.valueDate = valueDate;
		}

		public String getUploadTime() {
			return uploadTime;
		}

		public void setUploadTime(String uploadTime) {
			this.uploadTime = uploadTime;
		}

		public String getUploadBy() {
			return uploadBy;
		}

		public void setUploadBy(String uploadBy) {
			this.uploadBy = uploadBy;
		}

		public String getProcessStatus() {
			return processStatus;
		}

		public void setProcessStatus(String processStatus) {
			this.processStatus = processStatus;
		}

		public String getProcessMess() {
			return processMess;
		}

		public void setProcessMess(String processMess) {
			this.processMess = processMess;
		}

		public String getAtdId() {
			return atdId;
		}

		public void setAtdId(String atdId) {
			this.atdId = atdId;
		}

		public String getUploadStatus() {
			return uploadStatus;
		}

		public void setUploadStatus(String uploadStatus) {
			this.uploadStatus = uploadStatus;
		}

		public String getTotal() {
			return total;
		}

		public void setTotal(String total) {
			this.total = total;
		}

		public String getSuccess() {
			return success;
		}

		public void setSuccess(String success) {
			this.success = success;
		}

		public String getFail() {
			return fail;
		}

		public void setFail(String fail) {
			this.fail = fail;
		}

	}

	public static class UploadFileDetailMessage {
		private String lineNo;
		private String code;
		private String description;
		private String payref;
		public String getLineNo() {
			return lineNo;
		}
		public void setLineNo(String lineNo) {
			this.lineNo = lineNo;
		}
		public String getCode() {
			return code;
		}
		public void setCode(String code) {
			this.code = code;
		}
		public String getDescription() {
			return description;
		}
		public void setDescription(String description) {
			this.description = description;
		}
		public String getPayref() {
			return payref;
		}
		public void setPayref(String payref) {
			this.payref = payref;
		}

	}

	public static class UploadDetailClass {
		private String creditAC;
		private String bankAC;
		private String acName;
		private String debitRef;
		private Date effectDate;
		private String propertyRef;
		private String tenantName;
		private String  status;
		private String message;
		public String getCreditAC() {
			return creditAC;
		}
		public void setCreditAC(String creditAC) {
			this.creditAC = creditAC;
		}
		public String getBankAC() {
			return bankAC;
		}
		public void setBankAC(String bankAC) {
			this.bankAC = bankAC;
		}
		public String getAcName() {
			return acName;
		}
		public void setAcName(String acName) {
			this.acName = acName;
		}
		public String getDebitRef() {
			return debitRef;
		}
		public void setDebitRef(String debitRef) {
			this.debitRef = debitRef;
		}
		public Date getEffectDate() {
			return effectDate;
		}
		public void setEffectDate(Date effectDate) {
			this.effectDate = effectDate;
		}
		public String getPropertyRef() {
			return propertyRef;
		}
		public void setPropertyRef(String propertyRef) {
			this.propertyRef = propertyRef;
		}
		public String getTenantName() {
			return tenantName;
		}
		public void setTenantName(String tenantName) {
			this.tenantName = tenantName;
		}
		public String getStatus() {
			return status;
		}
		public void setStatus(String status) {
			this.status = status;
		}
		public String getMessage() {
			return message;
		}
		public void setMessage(String message) {
			this.message = message;
		}

	}
}
