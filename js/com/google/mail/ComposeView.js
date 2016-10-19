/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
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

CLASS({
   "package": "com.google.mail",
   "name": "ComposeView",
   "extends": "foam.ui.md.DetailView",
   "requires": [
      "foam.ui.md.ToolbarRichTextView",
      "foam.ui.md.TextFieldView"
   ],
  templates: [
    function CSS() {/*
.email-compose-view .richText {
  flex-grow: 1;
  margin-top: 30px;
  margin-left: -2px;
}
*/},
    function toHTML() {/*
<div id="%%id" class="email-compose-view">
$$to{placeholder: 'To', model_: 'foam.ui.md.TextFieldView'} <br>
$$cc{placeholder: 'Cc', model_: 'foam.ui.md.TextFieldView'} <br>
$$bcc{placeholder: 'Bcc', model_: 'foam.ui.md.TextFieldView'} <br>
$$subject{ placeholder: 'Subject', onKeyMode: true, model_: 'foam.ui.md.TextFieldView'}
$$body{model_: 'foam.ui.md.ToolbarRichTextView', height: 300, placeholder: 'Message'}
</div>
*/}
  ],

   "xxtemplates": [
      {
         model_: "Template",
         "name": "CSS",
         "template": "\u000a      .email-compose-view {\u000a        display: flex;\u000a        flex-direction: column;\u000a        height: 100%;\u000a      }\u000a\u000a      .content {\u000a        margin-left: 16px;\u000a        margin-top: 44px;\u000a        display: flex;\u000a        flex-direction: column;\u000a        flex-grow: 1;\u000a        position: relative;\u000a       }\u000a\u000a      .richText {\u000a        flex-grow: 1;\u000a        margin-top: 30px;\u000a        margin-left: -2px;\u000a      }\u000a\u000a      .richText .placeholder { font-size: 14px; font-family: Roboto; }\u000a\u000a      iframe {\u000a        border: none;\u000a      }\u000a\u000a      .actionButtonCView-send {\u000a        position: absolute;\u000a        bottom: 10px;\u000a        right: 24px;\u000a        box-shadow: 3px 3px 3px #aaa;\u000a        -webkit-box-shadow: 3px 3px 3px #aaa;\u000a        border-radius: 30px;\u000a      }\u000a\u000a      .md-text-field-container {\u000a        height: 68p x;\u000a        margin-left: -12px;\u000a        margin-top: -18px;\u000a        margin-bottom: -8px;\u000a      }\u000a    ",
      },
      {
         model_: "Template",
         "name": "toHTML",
         "template": "\u000a      <div id=\"<%= this.id %>\" class=\"email-compose-view\">\u000a        <div class=\"header\">\u000a          $$back{className: 'backButton'}\u000a          $$subject{mode: 'read-only', className: 'subject'}\u000a        </div>\u000a        <div class=\"content\">\u000a        $$to{placeholder: 'To', model_: 'foam.ui.md.TextFieldView'} <br>\u000a        $$cc{placeholder: 'Cc', model_: 'foam.ui.md.TextFieldView'} <br>\u000a        $$bcc{placeholder: 'Bcc', model_: 'foam.ui.md.TextFieldView'} <br>\u000a        $$subject{ placeholder: 'Subject', onKeyMode: true, model_: 'foam.ui.md.TextFieldView'}\u000a        $$body{model_: 'foam.ui.md.ToolbarRichTextView', height: 300, placeholder: 'Message'}\u000a        </div>\u000a        $$send{background: '#259b24', radius: 24, iconUrl: 'images/send.png'}\u000a      </div>\u000a    ",
      }
   ]
});
