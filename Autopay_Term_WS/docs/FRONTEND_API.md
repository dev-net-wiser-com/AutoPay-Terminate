# AutoPay SOAP Contract and Migration Notes

## Current frontend calls

| Frontend | Operation | Parameters |
| --- | --- | --- |
| Manual input | GetValueDate | None |
| Manual input | lookupTenancyNameLang | propertyRef, language |
| Manual input | saveScreenLang | screenInputs, screenId, loginID, language |
| Upload | fetchUploadPath | None |
| Upload | lookupUploadLog | date |
| Upload | newUploadLog | fileName, thru, uploadBy, status, atdID |
| Upload | getUploadDetailMessage | aptId, includeCorrect |
| Upload | inTakeLang | uploadDate, screenId, refId, language |
| Upload | deleteUploadLog | ppsID |

All nine called operations are published. All16 original operation names are retained by the explicit JAX-WS interface, including aliases and the three unused historical stubs: getPaymentReference, checkPropertyRef, validateLine. The stubs still return an empty string; no unsupported business implementation is invented.

Namespace remains http://pps.hmms.hkhs.com, and both old service-relative addresses remain available under the independent /Autopay_Term_WS context. JSON fields, tenancy lookup's backtick-delimited triple and the manual-input six-field/backtick and caret record format are preserved. newUploadLog/deleteUploadLog still return an empty string on success, while dates/counts/JSON reads return their original types as SOAP strings.

## Corrections

- GetRacAccnoFromDDInput always uses the exported four-argument signature. JDBC position4 is language, position5 is the numeric OUT account; position1 is the function return.
- zh_HK/zh_CN map to C; other or missing language values map to E. Validation uses the eight-argument overload, with explicit null cutoff/next-date values.
- Date reads close statements/connections and do not commit in auto-commit mode. Null dates or database failures return Fail: rather than silently returning an empty value.
- Lookup, list and file-scan failures propagate instead of becoming apparently successful empty lists. Access-right lookup uses bound property/user parameters.
- Manual save validates all rows, checks property access and sets the session user. The header, termination operations, detail rows and final counters commit in one transaction; any failure rolls back the batch. Validation failure cannot leak a connection or run a malformed final status update.
- A file's pending master log is locked with FOR UPDATE SKIP LOCKED. Another Start cannot process that same pending row concurrently. The lock precedes a file savepoint, so fatal rollback retains the lock until failure status is recorded.
- Successful file lines and their detail logs commit together at the end of a file. Failed lines roll back to their row savepoint and retain a failure detail. Fatal file errors roll back the file and record PROCESS_FAIL with zero committed successes, instead of overwriting the failure status with stale counters.
- The last30-day pending-file scan remains based on SYSDATE, as in the legacy implementation. The uploadDate argument is validated but does not redefine that historical scan window.
- Start does not slice a PPS-style date out of an AutoPay filename. The effective date still comes from HSK_RAC.getNextDDTermDate. Missing stored files return a failure instead of a misleading successful count.
- Parsed records with fewer than four fields are logged as failed lines. Blank lines remain excluded from totals. Partial, FAIL and EMPTY statuses are preserved.
- Deleting an upload log is allowed only while UPLOAD_SUCCESS; processed or missing rows return Fail: instead of silently succeeding.
- New upload logs accept the frontend's D / UPLOAD_SUCCESS state. Positive numeric attachment IDs and single filenames are required. No automatic retry is added for uncertain writes.

## Shared services and runtime acceptance

HMMSService.getConfig, ManagerWebService attachment operations, MenuWebService and FileHandleServlet remain in the existing shared WARs. This WAR does not replace them or change database packages/schema.

Acceptance must cover real WSDL parameter names/actions, SOAP Fault/Fail: responses, all nine called operations, JSON snapshots, date/language boundaries, valid/invalid properties, multi-row save rollback, file partial results, missing files and simultaneous Start calls. Confirm the target package and dependent triggers do not commit internally; internal commits would invalidate application savepoint/rollback assumptions.

No project build, application run, database call or end-to-end business test was performed on the editing workstation. Build on83 and validate in the intended test environment before promoting a WAR.
