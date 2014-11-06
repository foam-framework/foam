/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
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

MODEL({
  name: 'ContactView',
  extendsModel: 'ListValueView',
  imports: [
    'contactDao'
  ],
  requires: [
    'ArrayTileView',
    'AutocompleteListView',
    'Contact',
    'ContactListTileView',
    'ContactSmallTileView',
    'DefaultObjectDAO',
    'ListInputView',
  ],
  properties: [
    {
      name: 'name',
      documentation: 'Set to the name of the property of interest by PropertyView.'
    },
    {
      name: 'inputView',
      factory: function() {
        return this.ListInputView.create({
          name: this.name,
          dao: this.contactDao,
          property: this.Contact.EMAIL,
          placeholder: this.name.capitalize(),
          searchProperties: [
            this.Contact.EMAIL,
            this.Contact.FIRST,
            this.Contact.LAST,
            this.Contact.TITLE
          ],
          autocompleteView: this.AutocompleteListView.create({
            innerView: this.ContactListTileView,
            count: 8
          })
        });
      }
    },
    {
      name: 'valueView',
      factory: function() {
        return this.ArrayTileView({
          dao: this.DefaultObjectDAO({
            delegate: this.ContactAvatarDAO,
            factory: function(q) {
              var obj = this.Contact({});
              obj[q.arg1.name] = q.arg2.arg1;
              return obj;
            }
          }),
          property: this.Contact.EMAIL,
          tileView: this.ContactSmallTileView
        });
      }
    }
  ]
});

MODEL({
  name: 'ContactSmallTileView',
  extendsModel: 'DetailView',

  requires: [
    'Contact'
  ],

  constants: {
    REMOVE: 'remove'
  },

  properties: [
    {
      name: 'extraClassName',
      defaultValue: 'contactSmallTile'
    }
  ],

  templates: [
    function toInnerHTML() {/*
      <div class="contactSmallAvatar">$$avatar{ displayWidth: 27, displayHeight: 27 }</div>
      <div class="contactSmallName">$$displayName{ mode: 'read-only', escapeHTML: true }</div>
      <button id="<%= this.on('click', this.onRemove); %>" class="contactSmallX">x</button>
    */}
  ],

  listeners: [
    {
      name: 'onRemove',
      code: function() {
        this.publish(this.REMOVE, this.data);
      }
    }
  ]
});

MODEL({
  name: 'ContactListTileView',
  extendsModel: 'DetailView',

  properties: [
    {
      name: 'extraClassName',
      defaultValue: 'contactTile'
    }
  ],

  templates: [
    function toInnerHTML() {/*
      $$avatar{ displayWidth: 32, displayHeight: 32 }
      <ul class="contactTileDetails">
        <li>$$name{ mode: 'read-only', escapeHTML: true }</li>
        <li>$$address{ mode: 'read-only' }</li>
      </ul>
    */}
  ]
});

