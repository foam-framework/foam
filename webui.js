/*
 * Copyright 2012 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var Argument = FOAM.create({
   model_: 'Model',
   name: 'Argument',
   label: 'Argument',
   plural: 'Arguments',
   ids:
   [
      'name'
   ],
   tableProperties:
   [
      'name', 'type'
   ],
   properties:
   [
      {
         model_: 'Property',
         name: 'name',
         label: 'Name',
         displayWidth: 40
      },
      {
         model_: 'Property',
         name: 'type',
         label: 'Type',
         view: {
	   create: function() { return ChoiceView.create({choices: [
             'int',
             'String'
           ]})}}
      }
   ]
});


var Callback = FOAM.create({
   model_: 'Model',
   name: 'Callback',
   label: 'Callback',
   plural: 'Callbacks',
   ids:
   [
      'name'
   ],
   tableProperties:
   [
      'name'
   ],
   properties:
   [
      {
         model_: 'Property',
         name: 'name',
         label: 'Name',
         displayWidth: 40
      },
      {
         model_: 'Property',
         name: 'comment',
         label: 'Comment',
         displayWidth: 65
      },
      {
         model_: 'Property',
         name: 'arguments',
         label: 'Arguments',
         type: 'Array[Argument]',
         subType: 'Argument',
         valueFactory: function() { return []; },
         view: ArrayView
      },
      {
         model_: 'Property',
         name: 'includes',
         label: 'Includes',
         view: 'TextAreaView',
         displayWidth: 80,
         displayHeight: 5
      },
      {
         model_: 'Property',
         name: 'code',
         label: 'Code',
         view: 'TextAreaView',
         displayWidth: 80,
         displayHeight: 10
      }
   ]
});

var WebUI = FOAM.create({
   model_: 'Model',
   name: 'WebUI',
   label: 'WebUI',
   plural: 'WebUIs',
   ids:
   [
      'name'
   ],
   tableProperties:
   [
      'name',
      'title',
      'URL'
   ],
   properties:
   [
      {
         model_: 'Property',
         name: 'name',
         label: 'Name'
      },
      {
         model_: 'Property',
         name: 'title',
         label: 'Title',
         displayWidth: 40
      },
      {
         model_: 'Property',
         name: 'URL',
         label: 'URL'
      },
      {
         model_: 'Property',
         name: 'fileName',
         label: 'File Name'
      },
      {
         model_: 'Property',
         name: 'varName',
         label: 'Variable Name'
      },
      {
         model_: 'Property',
         name: 'className',
         label: 'Class Name'
      },
      {
         model_: 'Property',
         name: 'isDialog',
         label: 'Dialog',
         type: 'Boolean',
         view: 'BooleanView'
      },
      {
         model_: 'Property',
         name: 'extension',
         label: 'Extension',
         type: 'Boolean',
         view: 'BooleanView'
      },
      {
         model_: 'Property',
         name: 'isI18N',
         label: 'Supports I18N',
         type: 'Boolean',
         view: 'BooleanView'
      },
      {
         model_: 'Property',
         name: 'callbacks',
         label: 'Callbacks',
         type: 'Array[Callback]',
         subType: 'Callback',
         valueFactory: function() { return []; },
         view: ArrayView
      }
   ],
   actions:
   [
      {
         model_: 'Action',
         name: 'generate',
         label: 'Generate',
         action: function () {
           console.log(this.source());
         }
      }
   ],
   templates:
   [
      {
         model_: 'Template',
         name: 'source',
         description: 'Source',
         template: '> src/chrome/browser/resources/<%=this.fileName%>.html\n\n<!DOCTYPE HTML>\n<html i18n-values="dir:textdirection">\n<head>\n  <meta charset="utf-8">\n  <title><%= this.title %></title>\n  <link rel="stylesheet" href="<%= this.fileName %>.css">\n  <script src="strings.js"></script>\n  <script src="chrome://resources/js/cr.js"></script>\n  <% if ( this.isI18N ) { %>\n  <script src="chrome://resources/js/i18n_template.js"></script>\n  <% } %>\n  <script src="<%= this.fileName %>.js"></script>\n</head>\n<body i18n-values=".style.fontFamily:fontFamily;.style.fontSize:fontsize">\n  <h1><%= this.title %></h1>\n</body>\n</html>\n\n\n> src/chrome/browser/resources/<%=this.fileName%>.css\n\np {\n  white-space: pre-wrap;\n}\n\n\n> src/chrome/browser/resources/<%=this.fileName%>.js\n\ncr.define(\'<%=this.fileName%>\', function() {\n  \'use strict\';\n\n  <% if ( this.isI18N ) { %>\n  /**\n   * Object for accessing localized strings.\n   * @type {!LocalStrings}\n   */\n  var localStrings = new LocalStrings;\n\n  <% } %>\n  /**\n   * Be polite and insert translated hello world strings for the user on loading.\n   */\n  function initialize() {\n  <% if ( this.isI18N ) { %>\n    i18nTemplate.process(document, templateData);\n  <% } %>\n  }\n\n  // Return an object with all of the exports.\n  return {\n    initialize: initialize,\n  };\n});\n\ndocument.addEventListener(\'DOMContentLoaded\', <%=this.fileName%>.initialize);\n\n\n> src/chrome/browser/browser_resources.grd\n\n+ <include name="IDR_<%=this.fileName.toUpperCase()%>_HTML" file="resources<%=this.fileName%>.html" type="BINDATA" />\n+ <include name="IDR_<%=this.fileName.toUpperCase()%>_CSS" file="resources<%=this.fileName%>.css" type="BINDATA" />\n+ <include name="IDR_<%=this.fileName.toUpperCase()%>_JS" file="resources<%=this.fileName%>.js" type="BINDATA" />\n\n\n> src/chrome/common/url_constants.h\n\n+ extern const char kChromeUI<%=this.varName%>URL[];\n+ extern const char kChromeUI<%=this.varName%>Host[];\n\n\n> src/chrome/common/url_constants.cc\n\n+ const char kChromeUI<%=this.className%>URL[] = "chrome://<%=this.URL%>/";\n+ const char kChromeUI<%=this.className%>Host[] = "<%=this.URL%>";\n\n\n> src/chrome/app/generated_resources.grd\n\n\n> src/chrome/browser/ui/webui/<%=this.fileName%>_ui.h\n\n\n> src/chrome/chrome_browser.gypi\n\n      \'browser/ui/webui/<%=this.fileName%>_ui.cc\',\n      \'browser/ui/webui/<%=this.fileName%>_ui.h\',\n\n\n> src/chrome/browser/ui/webui/chrome_web_ui_controller_factory.cc\n#include "chrome/browser/ui/webui/<%=this.fileName%>_ui.h"\n#include "chrome/common/url_constants.h"\n...\nif (url.host() == chrome::kChromeUI<%=this.className%>Host)\n  return &NewWebUI<<%=this.className%>UI>;\n\n\n> browser/ui/webui/<%=this.fileName%>_ui.cc\n\n#include "chrome/browser/ui/webui/<%=this.fileName%>_ui.h"\n\n#include "chrome/browser/profiles/profile.h"\n#include "chrome/browser/ui/tab_contents/tab_contents_wrapper.h"\n#include "chrome/browser/ui/webui/chrome_web_ui_data_source.h"\n#include "chrome/common/url_constants.h"\n#include "grit/browser_resources.h"\n#include "grit/generated_resources.h"\n\n<%=this.className%>UI::<%=this.className%>UI(content::WebUI* web_ui)\n    : content::WebUIController(web_ui) {\n  // Set up the chrome://<%=this.URL%> source.\n  ChromeWebUIDataSource* html_source =\n      new ChromeWebUIDataSource(chrome::kChromeUI<%=this.className%>Host);\n\n  <% if ( this.isI18N ) { %>\n  // Localized strings.\n  html_source->AddLocalizedString("helloWorldTitle", IDS_HELLO_WORLD_TITLE);\n  html_source->AddLocalizedString("welcomeMessage", IDS_HELLO_WORLD_WELCOME_TEXT);\n  <% } %>\n\n  // As a demonstration of passing a variable for JS to use we pass in the name "Bob".\n  html_source->AddString("userName", "Bob");\n  html_source->set_json_path("strings.js");\n\n  // Add required resources.\n  html_source->add_resource_path("<%=this.fileName%>.css", IDR_<%=this.fileName.toUpperCase()%>_CSS);\n  html_source->add_resource_path("<%=this.fileName%>.js", IDR_<%=this.fileName.toUpperCase()%>_JS);\n  html_source->set_default_resource(IDR_<%=this.fileName.toUpperCase()%>_HTML);\n\n  Profile* profile = Profile::FromWebUI(web_ui);\n  profile->GetChromeURLDataManager()->AddDataSource(html_source);\n}\n\n<%=this.className%>UI::~<%=this.className%>UI() {\n}\n\n\n> browser/ui/webui/<%=this.fileName%>_ui.h\n#ifndef CHROME_BROWSER_UI_WEBUI_<%=this.fileName.toUpperCase()%>_UI_H_\n#define CHROME_BROWSER_UI_WEBUI_<%=this.fileName.toUpperCase()%>_UI_H_\n#pragma once\n\n#include "content/public/browser/web_ui_controller.h"\n\n// The WebUI for chrome://<%=this.URL%>\nclass <%=this.className%>UI : public content::WebUIController {\n public:\n  explicit <%=this.className%>UI(content::WebUI* web_ui);\n  virtual ~<%=this.className%>UI();\n private: \n  DISALLOW_COPY_AND_ASSIGN(<%=this.className%>UI);\n};\n\n#endif  // CHROME_BROWSER_UI_WEBUI_<%=this.fileName.toUpperCase()%>_UI_H_'
      }
   ]
});

