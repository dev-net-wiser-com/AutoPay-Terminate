package com.hkhs.hmms.netwiser;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import javax.sql.DataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/** Uses Spring's pool; production DB values are resolved by WildFly/Elytron. */
public final class DBConnection {
    private static final Logger LOG = LoggerFactory.getLogger(DBConnection.class);
    private static volatile DataSource dataSource;
    private DBConnection() {}
    public static void initialize(DataSource value) { dataSource = value; }
    public static Connection getConnection() {
        DataSource current = dataSource;
        if (current == null) throw new IllegalStateException("AutoPay data source has not been initialized");
        try {
            return current.getConnection();
        } catch (SQLException e) {
            throw new IllegalStateException("Cannot obtain a AutoPay database connection", e);
        }
    }
    private static void close(AutoCloseable resource) {
        if (resource != null) {
            try { resource.close(); } catch (Exception e) { LOG.warn("Unable to close database resource", e); }
        }
    }
    public static void closeResultSet(ResultSet value) { close(value); }
    public static void closePreparedStatement(PreparedStatement value) { close(value); }
    public static void closeConnection(Connection value) { close(value); }
    public static void beginTransaction(Connection value) {
        try { if (value != null) value.setAutoCommit(false); }
        catch (SQLException e) { throw new IllegalStateException("Cannot begin transaction", e); }
    }
    public static void rollback(Connection value) {
        try { if (value != null) value.rollback(); }
        catch (SQLException e) { throw new IllegalStateException("Cannot roll back transaction", e); }
    }
    public static void commit(Connection value) {
        try { if (value != null) value.commit(); }
        catch (SQLException e) { throw new IllegalStateException("Cannot commit transaction", e); }
    }
}
