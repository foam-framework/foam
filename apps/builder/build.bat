@ECHO OFF

set BASEDIR=%cd%
set BUILD_DIR=%BASEDIR%\build
set FOAM_DIR=..\..
set APP_DEF=foam.apps.builder.App
set BASEDIR_FILES=kiosk_view.html designer_view.html bg.js kiosk_bg.js questionnaire_bg.js config.js manifest.json _locales 128.png builder.css fonts empty.html


md "%BUILD_DIR%"

node --harmony "%FOAM_DIR%\tools\foam.js" foam.build.BuildApp appDefinition=%APP_DEF% "targetPath=%BUILD_DIR%"
copy "%FOAM_DIR%\core\foam.css" "%BUILD_DIR%\foam.css"
md "%BUILD_DIR%\resources\svg"
copy "%FOAM_DIR%\resources\svg\*.svg" "%BUILD_DIR%\resources\svg"
echo "%BASEDIR_FILES%"
for %%f in (%BASEDIR_FILES%) do (
  del /Q /F /A %BUILD_DIR%\%%f
  rmdir /S /Q %BUILD_DIR%\%%f
  Robocopy /S /E %BASEDIR%\%%f %BUILD_DIR%\%%f
  copy %BASEDIR%\%%f %BUILD_DIR%\%%f
)

cd "%BUILD_DIR%"
rem uglifyjs -b semicolons=false,beautify=false foam.js -c unused=false > foam-min.js
rem # mv foam-min.js foam.js
rem # rm unused.html
