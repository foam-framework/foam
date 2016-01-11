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
   "package": "foam.lib.contacts",
   "name": "Contact",
   "properties": [
      {
         type: 'String',
         "name": "id"
      },
      {
         model_: "Property",
         "name": "type",
         "hidden": true,
         "defaultValue": "Contact"
      },
      {
         type: 'String',
         "name": "title",
         "displayWidth": 50
      },
      {
         type: 'DateTime',
         "name": "updated",
         "factory": function () { return new Date(); }
      },
      {
         type: 'Boolean',
         "name": "deleted"
      },
      {
         type: 'String',
         "name": "etag"
      },
      {
         type: 'String',
         "name": "prefix"
      },
      {
         type: 'String',
         "name": "first"
      },
      {
         type: 'String',
         "name": "middle"
      },
      {
         type: 'String',
         "name": "last"
      },
      {
         type: 'String',
         "name": "suffix"
      },
      {
         type: 'String',
         "name": "displayName",
         "defaultValueFn": function () {
        // TODO: i18n and add middle/prefix/suffix when applicable.
        if ( this.title.length > 0 )
          return this.title;

        if ( this.first.length > 0 || this.last.length > 0 )
          return this.first + ' ' + this.last;

        return this.email;
      }
      },
      {
         type: 'String',
         "name": "email",
         "label": ""
      },
      {
         type: 'Array',
         "name": "phoneNumbers",
         "subType": "PhoneNumber"
      },
      {
         type: 'Array',
         "name": "addresses",
         "subType": "Address"
      },
      {
         type: 'Date',
         "name": "birthday"
      },
      {
         type: 'String',
         "name": "url",
         "displayWidth": 70
      },
      {
         model_: "Property",
         "name": "avatar",
         "type": "String",
         "view": "foam.ui.ImageView",
         "defaultValueFn": function () {
        var key = this.title ? this.title[0].toUpperCase() : (
          this.email ? this.email[0].toUpperCase() : '' );
        return this.generateAvatar(key);
      }
      },
      {
         model_: "Property",
         "name": "iconURL",
         "view": "foam.ui.ImageView",
         "defaultValue": "images/contact.png"
      },
      {
         type: 'String',
         "name": "note",
         "displayHeight": 10
      }
   ],
   "actions": [],
   "constants": [],
   "messages": [],
   "methods": [
      {
         model_: "Method",
         "name": "init",
         "code": function () {
      this.SUPER();
      if ( ! this.model_.getPrototype().generateAvatar.memoized ) {
        // Memoize the avatar to save time generating it.
        // TODO: Just set memoize in the method model when that is suppored.
        this.model_.getPrototype().generateAvatar =
          memoize(this.model_.getPrototype().generateAvatar);
        this.model_.getPrototype().generateAvatar.memoized = true;
      }
    },
         "args": []
      },
      {
         model_: "Method",
         "name": "generateAvatar",
         "code": function (letter) {
      if ( letter.length < 1 ) return '';
      return 'data:image/svg+xml;utf-8,<svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0" y="0" width="21" height="21"><rect width="21" height="21" x="0" y="0" style="fill:#d40000"/><text x="10" y="17" style="text-anchor:middle;font-size:19;font-style:normal;font-weight:bold;font-family:Arial, sans;fill:#fff">' + letter + '</text></svg>';
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
