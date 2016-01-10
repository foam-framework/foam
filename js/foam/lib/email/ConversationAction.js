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
  "name": "ConversationAction",
  "extends": "Action",
  "properties": [
    {
      "name": "name",
      "defaultValueFn": function () {
        return this.delegate ? this.delegate.name : 'ConversationAction';
      }
    },
    {
      "name": "iconUrl",
      "defaultValueFn": function () { return this.delegate.iconUrl; },
    },
    {
      "name": "help",
      "defaultValueFn": function () { return this.delegate.help; },
    },
    {
      type: 'Model',
      "name": "delegate"
    },
    {
      "name": "action",
      "defaultValue": function (action) {
        var emails = this.emails;
        if ( action.applyOnAll ) {
          emails.forEach(function(e) {
            action.delegate.action.call(e);
          });
        } else if ( emails.length ) {
          var e = emails[emails.length - 1];
          action.delegate.action.call(e);
        }
      }
    },
    {
      "name": "applyOnAll",
      "defaultValue": true
    }
  ]
});
