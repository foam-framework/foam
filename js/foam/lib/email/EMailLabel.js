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
   "package": "foam.lib.email",
   "name": "EMailLabel",
   "ids": [
      "id"
   ],
   "properties": [
      {
         type: 'String',
         "name": "id",
         "label": "Label ID"
      },
      {
         type: 'String',
         "name": "displayName",
         "label": "Display Name"
      },
      {
         type: 'Int',
         "name": "color",
         "label": "color",
         "defaultValue": 0
      }
   ],
   "actions": [],
   "constants": [
      {
         model_: "Constant",
         "name": "SystemLabels",
         "value":          {
                        "ALL": "^all",
            "DRAFT": "^r",
            "IMPORTANT": "^io_im",
            "INBOX": "^i",
            "MUTED": "^g",
            "OPENED": "^o",
            "REPLIED": "^io_re",
            "SENT": "^f",
            "SPAM": "^s",
            "STARRED": "^t",
            "TRASH": "^k",
            "UNREAD": "^u"
         }
      }
   ],
   "messages": [],
   "methods": [
      {
         model_: "Method",
         "name": "RENDERABLE_SYSTEM_LABELS",
         "code": function () {
      if ( ! result ) {
         result = fn.call(this);
      }
      return result;
   },
         "args": []
      },
      {
         model_: "Method",
         "name": "SYSTEM_LABEL_RENDER_NAMES",
         "code": function () {
      if ( ! result ) {
         result = fn.call(this);
      }
      return result;
   },
         "args": []
      },
      {
         model_: "Method",
         "name": "SEARCHABLE_SYSTEM_LABELS",
         "code": function () {
      if ( ! result ) {
         result = fn.call(this);
      }
      return result;
   },
         "args": []
      },
      {
         model_: "Method",
         "name": "isSystemLabel",
         "code": function () {
          return this.displayName.charAt(0) == '^';
        },
         "args": []
      },
      {
         model_: "Method",
         "name": "isRenderable",
         "code": function () {
          return !this.isSystemLabel() || this.RENDERABLE_SYSTEM_LABELS()[this.displayName];
        },
         "args": []
      },
      {
         model_: "Method",
         "name": "getRenderName",
         "code": function () {
          var displayName = this.displayName;
          return this.SYSTEM_LABEL_RENDER_NAMES()[displayName] || displayName;
        },
         "args": []
      },
      {
         model_: "Method",
         "name": "isSearchable",
         "code": function () {
          return !this.isSystemLabel() || this.SEARCHABLE_SYSTEM_LABELS()[this.displayName];
        },
         "args": []
      },
      {
         model_: "Method",
         "name": "getSearch",
         "code": function () {
          switch(this.displayName) {
           case this.SystemLabels.ALL:
            return '-label:^r,^s,^k';
           case this.SystemLabels.SENT:
            return 'f:me';
           default:
            return 'label:"' + this.displayName + '"';
          }
        },
         "args": []
      }
   ],
   "listeners": [],
   "templates": [],
   "models": [],
   "tests": [],
   "relationships": [],
   "issues": []
});
