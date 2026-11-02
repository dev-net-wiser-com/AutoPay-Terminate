# AutoPay Termination Frontend: WAR Build and Deployment

## Scope and menu entries

The React frontend is packaged as `target/autopay.war`. Its independent backend is `Autopay_Term_WS`; shared iHousing services remain separate deployments.

Keep both existing menu identifiers and hash routes:

- `/autopay/#/H5_autopay_terminateInput`: manual termination input.
- `/autopay/#/H5_autopay_terminateUpload`: disk upload and processing.

Local navigation follows the PPS project: `src/App.js` defines an `ITS > Operations` menu containing both AutoPay entries and loads it into Redux before reading cached menus or requesting the backend menu. The existing HeadDropdown/DropMenu components render it; there is no separate localMenu.js.

This menu is enabled only for development mode on localhost, 127.0.0.1 or [::1]. It is rebuilt on page load and is not written to the shared menu cache. Published builds continue to use the original iHousing menus, login and permission data. Local navigation creates no test login and grants no backend permissions.

## Build environment on server 83

| Tool | Required baseline |
| --- | --- |
| Node.js | 14.16.0 |
| npm | 6.14.11 |
| React | Existing version 16 dependency range |
| react-scripts | 4.0.3 |
| node-sass | 4.14.1 |
| Java | JDK 21 for Maven packaging; confirm on server 83 |
| Maven | 3.9.x recommended; confirm the installed version |

Use the workstation for source edits and static inspection only. Run dependency installation, the development server and builds on server 83. Copy the complete frontend source, including hidden configuration files. Do not copy workstation node_modules, build or target directories.

Check the tools in the frontend directory:

```bat
node -v
npm.cmd -v
java -version
mvn -v
where node
where npm
```

## First installation and lockfile

The original project did not include package-lock.json and explicitly ignored it. The ignore rule has been removed. Do not copy the PPS lockfile or generate a new lockfile using a newer npm on the workstation.

If no validated project lockfile exists yet, run on server 83 using npm 6:

```bat
npm.cmd install --production=false
npm.cmd run build
mvn clean package -Dskip.npm=true
```

After installation and the build succeed, keep and commit this project's package-lock.json. npm 6 produces lockfileVersion 1. If the file has already been generated successfully on server 83, retain it instead of regenerating it unnecessarily.

Subsequent clean builds use:

```bat
mvn clean package
```

The POM runs npm ci --production=false and then npm run build. A missing or mismatched lockfile makes npm ci fail. Windows uses npm.cmd automatically. The WAR output is target/autopay.war.

node-sass requires the native binary matching Node 14. If its download fails, check the server proxy, cache and build tools. Do not upgrade Node or run npm audit fix as an installation workaround.

## Optional development server

After dependencies have been installed:

```bat
npm.cmd start
```

Open on server 83:

- `http://localhost:3000/#/`
- `http://localhost:3000/#/H5_autopay_terminateInput`
- `http://localhost:3000/#/H5_autopay_terminateUpload`

The tracked .env.development sets PUBLIC_URL=/ for npm start. Production builds retain homepage=/autopay. Copy source changes to server 83 and refresh the browser; dependency changes require an updated installation. Restart npm start after modifying setupProxy.js or environment files.

## Service addresses

Configure URLs directly in src/service/service.js. moduleSetting.js and serviceProxy.js read that configuration rather than maintaining separate hardcoded hosts.

- localAutopayBackendUrl initially points to http://192.9.200.47:8080 for the independent AutoPay service. Confirm the actual deployment before use.
- localBackendUrl initially points to the same server for shared iHousing services; the two targets can differ.
- npm start uses setupProxy.js to forward /Autopay_Term_WS, /iHousing_WS and /iHousing. Proxy targets are also read from service.js.
- Published WARs use the frontend origin by default. For services on another server, configure AUTOPAY_SERVICE_BASE_URL and SERVICE_BASE_URL in service.js, rebuild, and verify reverse-proxy or CORS settings.
- Persisted attachment download links use the actual shared-service address, not the temporary localhost development proxy address.

| Service | Path | SOAP namespace |
| --- | --- | --- |
| AutoPay | /Autopay_Term_WS/services/AutopayTermService.AutopayTermServiceHttpSoap11Endpoint/ | http://pps.hmms.hkhs.com |
| System configuration | /iHousing_WS/services/HMMSService/ | http://www.hkhs.com |
| Attachment metadata | /iHousing_WS/services/ManagerWebService/ | http://webservice.hmms.hkhs.com |
| Menu | /iHousing_WS/services/MenuWebService/ | Existing HTTP GET contract |
| File upload/download | /iHousing/FileHandleServlet | Multipart upload / HTTP download |

SOAP namespaces identify contracts, not server addresses. Keep the old AutoPay namespace even though the Java package is now autopay. SOAP result parsing uses XML localName and accepts different prefixes such as ns: and ns2:.

## Frontend behavior and remaining backend work

- The two pages use separate Redux action namespaces, preventing the old shared RMS_ATM action types from overwriting the other page's state.
- Manual lookup fills tenancy name, payer name and bank account. Editing a reference clears stale account details; outdated asynchronous responses are ignored.
- Save calls the existing saveScreenLang operation using the legacy six-field format. Rows marked for deletion are excluded. The frontend validates the minimum termination date, login, completed lookup and reserved separators, and prevents repeated submission while busy.
- Upload uses the actual attachment configuration ID, refCode=APT001 and URL-encoded download parameters. File upload, attachment insertion and upload-log insertion run sequentially. Fail: responses and non-numeric attachment IDs do not count as success.
- The legacy newUploadLog and deleteUploadLog operations return an empty string on success. The frontend preserves this contract.
- Start supplies language, restores loading state after errors, and does not automatically retry write operations.

This frontend change does not modify or upgrade the backend. The old backend still has known JDBC language/OUT parameter inconsistencies, date-query transaction issues and weak error handling. Backend migration and integration verification remain necessary. The frontend displays failures rather than inventing successful results.

## Verification on server 83 and the test environment

1. Install dependencies with Node 14/npm 6, build React and inspect the WAR. Verify both entries and their JavaScript/CSS assets.
2. Check the independent AutoPay endpoint and shared services, WSDL parameter names and namespaces. Load the business date, attachment configuration and upload logs.
3. Use valid test-database property/payment references to verify lookup, reference changes, adding/deleting rows, date boundaries and save counts. Check the database outcome.
4. Test an approved DSK file, disallowed extensions, oversized files, duplicates and invalid content. Inspect attachment IDs, upload logs, Start results and detail messages.
5. Verify SOAP Fault, Fail:, network errors, attachment failures and upload-log failures. Buttons must recover. If a write response is uncertain, inspect server records before retrying manually.
6. Upload and termination invoke real database writes. Other/Testing/SampleFiles contains historical files without complete fixture data or expected results; their presence does not establish successful business validation.

Workstation checks were static and used simulated responses. No npm installation, React/Maven build, remote deployment or database execution was performed on the workstation.
