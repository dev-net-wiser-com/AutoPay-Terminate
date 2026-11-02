# AutoPay Termination Backend - JDK 21 / Spring Boot

## Scope and runtime

This is an independent AutoPay WAR: **Autopay_Term_WS.war**, context **/Autopay_Term_WS**. It does not publish PPSUploadService or bundle Manager/HMMS/Menu/FileHandle services.

The framework follows the completed PPS reference: Java21, Maven3.9+, Spring Boot3.5.16 and Apache CXF4.1.9. Use a compatible Jakarta Servlet runtime; the PPS reference reports WildFly34 on47 and a configured production runtime onD21. Confirm the actual target runtime before deployment.

The workstation is for edits and static inspection. Build on83, then deploy through the existing environment procedure. No local dependency installation, Maven build, application launch, database call or remote deployment was performed during this migration.

## Build on83

```bat
java -version
mvn -v
mvn clean package -Plocal
```

Production:

```bat
mvn clean package -Pprd
```

The default Maven profile is prd. Output is target/Autopay_Term_WS.war. Activate only one profile, and use clean when switching profiles. The enforcer requires Java21 and Maven3.9+. Package a fresh WAR rather than copying old classes, Axis2 archives or workstation output.

Runtime dependencies are CXF JAX-WS, Spring JDBC/Hikari, Oracle JDBC and Logback. JSON-lib is retained with its original date/integer processors to preserve response formatting; explicit BeanUtils/Collections versions override its old transitive versions. No Axis2, Log4j1, Manager/iBATIS, JPA or test-framework dependency is added. Oracle JDBC is runtime-scoped because the source now uses standard java.sql.Types.

Use `mvn dependency:tree` on83 to inspect the resolved graph and confirm old Axis/Log4j artifacts are absent. This has not been substituted with a workstation build.

## SOAP contract

Both addresses publish the same 16 AutoPay operations:

- /Autopay_Term_WS/services/AutopayTermService
- /Autopay_Term_WS/services/AutopayTermService.AutopayTermServiceHttpSoap11Endpoint/

Append ?wsdl to inspect the generated contract. Keep namespace **http://pps.hmms.hkhs.com**; it is a contract identifier, not a physical address or Java package name.

AutopayTermServiceApi explicitly defines operation names, SOAP actions, parameter names and the return element. Each SOAP operation creates a fresh business object. Legacy state is never shared through a singleton business instance.

The existing frontend already targets this context. Its localhost development proxy initially uses47:8080, but frontend URLs remain editable in AutopayTermination/src/service/service.js. This backend migration does not change frontend files.

Shared deployments must remain reachable:

- iHousing_WS: HMMSService, ManagerWebService and MenuWebService.
- iHousing: FileHandleServlet for upload/download.

CORS permits configured origins and Content-Type, SOAP, SOAPAction and Accept headers. The development proxy normally keeps browser requests same-origin. WildFly deployment metadata excludes its webservices, jaxrs and logging subsystems for this WAR, allowing the bundled CXF and Logback stacks to own those functions. Other WARs are unaffected.

## Profiles

```text
src/main/resources/
  local/application.properties
  local/upload.properties
  prd/application.properties
  prd/upload.properties
```

Maven copies only the selected pair into the classpath root. application.properties imports upload.properties. No duplicated service-level jdbc.properties remains active.

Local profile: the test connection settings are copied from the user-provided PPS local configuration. They are reference settings for the same integration environment, not a newly verified AutoPay database connection. Confirm that this account can access HSK_RAC and AutoPay tables before business testing. Database values are not printed in migration reports.

Production profile:

```properties
spring.datasource.url=${ihousing.db.url}
spring.datasource.username=${ihousing.db.username}
spring.datasource.password=${ihousing.db.password}
```

WildFly resolves Elytron Credential Store encrypted expressions and supplies these system properties. The application does not decrypt credentials or require a new JNDI datasource. Missing properties cause startup failure instead of falling back to old plaintext credentials.

These system property names are shared within a WildFly JVM. Reuse the existing values only if they select the intended AutoPay database account. Do not overwrite PPS or another application's settings. If accounts differ, configure a separate property prefix and change the three placeholders accordingly.

## WildFly Credential Store

Templates are under jboss/ and are **not executed automatically**:

1. Inspect the existing ihousing.db.* properties, Credential Stores and encryption resolvers.
2. If an appropriate configuration already exists, reuse it without adding duplicate properties.
3. Otherwise run configure-autopay.cli against the intended server. It creates autopayExpressionStore and only initializes expression=encryption when that resource is absent. It does not replace existing resolvers.
4. If expression=encryption already exists, register autopay-resolver only when missing:

```text
/subsystem=elytron/expression=encryption:read-attribute(name=resolvers)
/subsystem=elytron/expression=encryption:list-add(name=resolvers,value={name=autopay-resolver,credential-store=autopayExpressionStore,secret-key=key})
```

Generate an encrypted expression for each real value in a trusted management session with CLI history disabled:

```text
/subsystem=elytron/expression=encryption:create-expression(resolver=autopay-resolver,clear-text="REPLACE_WITH_THE_REAL_VALUE")
```

Use the returned expression in bind-autopay-db.cli.example. Keep the literal ${ENC::...} syntax intact. The template uses add for missing system properties; inspect existing properties and use write-attribute only after checking the account they serve. Never deploy the placeholder template as real credentials.

Reference: https://www.wildfly.org/guides/security-credential-store-enc-exp/

## Upload and processing paths

The actual multipart servlet remains in iHousing.war. AutoPay only returns upload path information and reads the stored file referenced by ATD_ID.

- autopay.upload-root: optional root returned to the upload servlet.
- autopay.processing-root: optional local root used by this backend. D.APT001/TOKEN_BR is appended.
- uploadFolder: legacy full processing-directory fallback, already including the module/ref directories.
- downloadFolder: retained for configuration consistency; downloading is handled by the external servlet.
- autopay.file-charset: explicit input encoding; UTF-8 is the initial value. The supplied ASCII samples do not verify the encoding of non-ASCII bank files.

The local pair uses the same known47 shared upload root as PPS, including the physical directory name pps-upload. AutoPay uses its own D.APT001/TOKEN_BR subdirectory; do not rename the shared physical root merely to change a label. The upload servlet and reader must see the same files. Update these literal path settings if your target setup differs.

Production overrides are empty. The default root comes from HSK_HMMS_GEN.getJbossUploadPath; the old dollar-marker convention is retained for a complete directory. A missing database root is exposed as Fail: by fetchUploadPath; processing may use a configured non-empty legacy uploadFolder fallback. Confirm all fallbacks before deployment.

Stored filenames must be single filenames. Processing requires an absolute local directory and checks the resolved real path, including symlinks, stays inside it. This does not constrain the upload server to use the same OS path spelling.

## Logging

Logback writes logs/autopay-termination.log with rolling size/history settings. Old log4j.properties, commons-logging.properties, Axis2 administration pages and modules are archived, not packaged. SQL parameters, raw bank-file lines and successful account responses are no longer printed to standard output.

Database/file exceptions are logged with operation context and returned using the existing Fail: convention. Treat logs and response details according to the existing internal access policy.

## Optional Windows startup script

Run only on the intended build/runtime host. Set JAVA_HOME to21 and JBOSS_HOME to its actual WildFly installation. The inherited reference default JBOSS_HOME is D:\wildfly-39.0.1.Final; change it if your host differs.

```bat
start-service.bat
start-service.bat --debug
start-service.bat --suspend
start-service.bat --prd
```

Default/debug/suspend builds local, copies Autopay_Term_WS.war into the deployment scanner directory, and starts WildFly in the foreground. AUTOPAY_DEBUG_PORT defaults to8788 to avoid the PPS script's8787. --prd only builds the production WAR; it does not deploy or start WildFly. If WildFly is already running, build and use the existing deployment procedure instead of starting another instance.

## Business behavior and verification

See docs/FRONTEND_API.md for contract coverage and migration changes. The migration preserves the stored-procedure business rules and JSON field names, but fixes resource/error handling, JDBC argument order, transaction behavior and file-processing concurrency. These corrections require test-environment validation; syntax or contract inspection does not establish business acceptance.

On83, build and inspect the WAR before deploying. On47/D21, verify deployment logs, both WSDLs, GetValueDate, fetchUploadPath and lookupUploadLog first. Then use approved test accounts/files to validate lookup, manual termination, partial file results and rollback. Compare actual HSK_RAC package signatures with SQL/HKHS.HSK_RAC.sql; the repository export is reference evidence, not proof of the target database version.

Database/v1.0.0 contains menu migration/rollback tools, not table creation or fixture data. Do not execute them wholesale. Historical DSK files have no complete expected-result fixtures. No sample file was uploaded or processed by this migration.

The pre-upgrade source/configuration is preserved in Other/LegacyBackend/Autopay_Term_WS_pre_jdk21 with original-files.json hashes. Earlier SQL citations now refer to that snapshot because live source line numbers changed.
