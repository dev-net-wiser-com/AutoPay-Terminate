@echo off
setlocal EnableExtensions
rem Usage: start-service.bat [--debug|--suspend|--prd]
cd /d "%~dp0"
if not defined JBOSS_HOME set "JBOSS_HOME=D:\wildfly-39.0.1.Final"
if not defined AUTOPAY_DEBUG_PORT set "AUTOPAY_DEBUG_PORT=8788"
set "DEPLOY_DIR=%JBOSS_HOME%\standalone\deployments"
set "WAR_FILE=%CD%\target\Autopay_Term_WS.war"
set "MODE=%~1"
if not "%~2"=="" goto usage
if /I "%MODE%"=="--prd" (
    echo [INFO] Building production WAR with the prd profile...
    call mvn clean package -Pprd
    if errorlevel 1 exit /b 1
    if not exist "%WAR_FILE%" exit /b 1
    echo [SUCCESS] %WAR_FILE%
    echo [INFO] Production mode does not deploy or start WildFly.
    exit /b 0
)
if not "%MODE%"=="" if /I not "%MODE%"=="--debug" if /I not "%MODE%"=="--suspend" goto usage
if not defined JAVA_HOME (
    echo [ERROR] Set JAVA_HOME to JDK 21.
    exit /b 1
)
if not exist "%JBOSS_HOME%\bin\standalone.bat" (
    echo [ERROR] Invalid JBOSS_HOME.
    exit /b 1
)
if not exist "%DEPLOY_DIR%" (
    echo [ERROR] WildFly deployment directory does not exist.
    exit /b 1
)
echo [INFO] Building local WAR...
call mvn clean package -Plocal
if errorlevel 1 exit /b 1
if not exist "%WAR_FILE%" exit /b 1
echo [INFO] Deploying Autopay_Term_WS.war to local WildFly...
copy /Y "%WAR_FILE%" "%DEPLOY_DIR%\Autopay_Term_WS.war" >nul
if errorlevel 1 exit /b 1
if /I "%MODE%"=="--debug" (
    call "%JBOSS_HOME%\bin\standalone.bat" --debug %AUTOPAY_DEBUG_PORT%
) else if /I "%MODE%"=="--suspend" (
    set "JAVA_OPTS=%JAVA_OPTS% -agentlib:jdwp=transport=dt_socket,server=y,suspend=y,address=127.0.0.1:%AUTOPAY_DEBUG_PORT%"
    call "%JBOSS_HOME%\bin\standalone.bat"
) else (
    call "%JBOSS_HOME%\bin\standalone.bat"
)
exit /b %ERRORLEVEL%
:usage
echo Usage: %~nx0 [--debug^|--suspend^|--prd]
exit /b 1
