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
  name: 'PopupAutocompleteView',
  package: 'foam.ui.md',
  extends: 'foam.ui.SimpleView',
  traits: ['foam.input.touch.VerticalScrollNativeTrait'],

  imports: [
    'dao',
    'queryFactory',
    'returnOnSelect',
    'rowView',
    'stack'
  ],

  exports: [
    'selection$'
  ],

  properties: [
    {
      type: 'ViewFactory',
      name: 'rowView',
      defaultValue: 'foam.ui.md.TextFieldView'
    },
    {
      name: 'data'
    },
    {
      name: 'softData',
      documentation: 'The object currently under consideration.',
      factory: function() {
        var found = false;
        this.dao.find(this.data, {
          put: function(x) {
            found = true;
            this.softData = x;
          }.bind(this)
        });
        // Synchronous DAOs will already have called put, and I don't want to
        // overwrite the value.
        return found ? this.softData : '';
      },
      postSet: function(old, nu) {
        if (nu) {
          this.q = this.objectToQuery(nu);
          this.selected = true;
        }
      }
    },
    {
      name: 'q',
      label: 'Search',
      view: {
        factory_: 'foam.ui.md.TextFieldView',
        onKeyMode: true,
        floatingLabel: false
      },
      postSet: function(old, nu) {
        this.selected = false;
      }
    },
    {
      name: 'returnOnSelect',
      defaultValue: true
    },
    {
      name: 'selected',
      defaultValue: false
    },
    {
      name: 'subType',
      documentation: 'Based on ReferenceProperty, the name of the type.'
    },
    {
      name: 'subKey',
      documentation: 'The mLang expression for looking up the key from a ' +
          'whole object. Set as a string. Defaults to .ID',
      factory: function() { return 'ID'; },
      preSet: function(old, nu) {
        return typeof nu === 'string' ?
          this.X.lookup(this.subType + '.' + constantize(nu)) : nu;
      }
    },
    {
      model_: 'foam.core.types.DAOProperty',
      name: 'dao',
      documentation: 'The DAO used to look up the models. Defaults to ' +
          'mySubTypeDAO for subType == "MySubType".',
      factory: function() {
        var basename = this.subType.split('.').pop();
        var name = basename[0].toLowerCase() + basename.substring(1);
        var daoName = name + 'DAO';
        return this.X[daoName];
      }
    },
    {
      name: 'wrappedDAO',
      factory: function() {
        return this.hideListOnSingle ?
            this.SingleEntryHidingDAO.create({ delegate: this.dao }) : this.dao;
      }
    },
    {
      model_: 'foam.core.types.DAOProperty',
      name: 'filteredDAO',
      dynamicValue: function() {
        this.q; this.wrappedDAO; this.limit;
        var q = this.q ? this.queryFactory(this.q) : TRUE;
        var dao = this.wrappedDAO.where(q).limit(this.limit);
        return dao;
      },
      view: {
        factory_: 'foam.ui.DAOListView',
        className: 'rows',
        tagName: 'div',
        useSelection: true
      }
    },
    {
      name: 'queryFactory',
      defaultValue: function(q) { return STARTS_WITH_IC(this.subKey, q); }
    },
    {
      name: 'objectToQuery',
      documentation: 'Turns an object from the DAO into a query string.',
      factory: function() {
        return function(obj) { return this.subKey.f(obj); }.bind(this);
      }
    },
    {
      name: 'returnOnSelect',
      defaultValue: true
    },
    {
      name: 'scrollerID',
      factory: function() {
        return this.nextID();
      }
    },
    {
      // TODO: DAO should be pre-limited instead
      name: 'limit',
      defaultValue: 40
    },
    {
      name: 'className',
      defaultValue: 'PopupAutocompleteView'
    },
    {
      name: 'selection',
      postSet: function(old, nu) {
        if (nu) {
          if (this.returnOnSelect) {
            this.data = this.subKey ? this.subKey.f(nu) : nu;
            this.doClose();
          } else {
            this.softData = nu;
          }
        }
      }
    }
  ],

  templates: [
    function CSS() {/*
      .PopupAutocompleteView {
        height: 100%;
        left: 0;
        position: fixed;
        top: 0;
        width: 100%;
      }

      .PopupAutocompleteView-container {
        position: relative;
        height: 100%;
        width: 100%;
      }

      .PopupAutocompleteView-overlay {
        background: black;
        opacity: 0.6;
        position: absolute;
        height: 100%;
        width: 100%;
      }

      .PopupAutocompleteView-dialog-container {
        display: flex;
        height: 100%;
        justify-content: center;
        width: 100%;
      }

      @media (min-width: 400px) {
        .PopupAutocompleteView-dialog-container {
          align-items: center;
          padding: 20px;
        }
      }

      .PopupAutocompleteView-dialog {
        background: #fff;
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        max-width: 400px;
        overflow: hidden;
      }

      @media (min-width: 400px) {
        .PopupAutocompleteView-dialog {
          height: 25%;
          min-height: 300px;
        }
      }

      .PopupAutocompleteView-header {
        align-items: center;
        border-bottom: 1px solid #e0e0e0;
        display: flex;
        flex-shrink: 0;
        padding-left: 16px;
      }
      .PopupAutocompleteView-list {
        overflow-y: auto;
      }
    */},
    function toInnerHTML() {/*
      <div class="PopupAutocompleteView-container">
        <div class="PopupAutocompleteView-overlay"></div>
        <div class="PopupAutocompleteView-dialog-container">
          <div class="PopupAutocompleteView-dialog">
            <div class="PopupAutocompleteView-header">
              $$q{
                extraClassName: 'grow',
                clearAction: true,
                underline: false
              } $$cancel
            </div>
            <div id="<%= this.scrollerID %>" class="PopupAutocompleteView-list">
              $$filteredDAO{ rowView: this.rowView }
            </div>
          </div>
        </div>
      </div>
    */}
  ],

  methods: {
    doClose: function() {
      // Don't close twice.
      if ( this.closed_ ) return;
      this.closed_ = true;

      this.qView.blur();
      this.stack.back();
    },
    focus: function() {
      console.log('PAV focus');
      this.qView.focus();
    }
  },

  actions: [
    {
      name: 'cancel',
      label: '',
      iconUrl: 'images/ic_clear_black_24dp.png',
      isAvailable: function() { return !this.q; },
      code: function() {
        this.doClose();
      }
    }
  ]
});
