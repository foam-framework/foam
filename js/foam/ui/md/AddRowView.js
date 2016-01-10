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
  name: 'AddRowView',
  package: 'foam.ui.md',
  extends: 'foam.ui.SimpleView',
  traits: ['foam.ui.layout.PositionedDOMViewTrait', 'foam.input.touch.VerticalScrollNativeTrait'],

  requires: [
    'foam.ui.md.ToolbarCSS'
  ],

  imports: [
    'dao',
    'hideListOnSingle',
    'queryFactory',
    'returnOnSelect',
    'rowView',
    'stack'
  ],

  exports: [
    'selection$'
  ],

  models: [
    {
      model_: 'Model',
      name: 'SingleEntryHidingDAO',
      extends: 'foam.dao.ProxyDAO',
      methods: {
        select: function(sink, options) {
          var firstEntry;
          var seen = 0;
          sink = sink || [];
          var mySink = {
            put: sink && sink.put && function(x) {
              seen++;
              if (seen === 1) {
                firstEntry = x;
              } else if (seen === 2) {
                sink.put(firstEntry);
                sink.put(x);
              } else {
                sink.put(x);
              }
            },
            error: sink && sink.error && sink.error.bind(sink),
            eof: sink && sink.eof && sink.eof.bind(sink)
          };

          return this.delegate.select(mySink, options);
        }
      }
    }
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
        darkBackground: true,
        floatingLabel: false
      },
      postSet: function(old, nu) {
        this.selected = false;
      }
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
      // TODO: DAO should be pre-limited instead
      name: 'limit',
      defaultValue: 40
    },
    {
      name: 'className',
      defaultValue: 'AddRowView'
    },
    {
      name: 'scrollerID',
      factory: function() { return this.nextID(); }
    },
    {
      name: 'hideListOnSingle',
      documentation: 'When true, the suggestion list disappears when there is only one match. When false it is always visible. The default (false) is generally mobile-friendly, while true is better on desktop.',
      defaultValue: false
    },
    {
      name: 'returnOnSelect',
      documentation: 'When true, updates $$DOC{ref:".data"} and returns when ' +
          'the user chooses an entry. When false, the query is updated to ' +
          'match the selected row.',
      defaultValue: true
    },
    {
      name: 'allowFocus',
      documentation: 'Set true to allow the browser to focus the input box. ' +
          'This can cause nasty scroll jank on mobile.',
      defaultValue: false
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
      .AddRowView {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        background: #fff;
        overflow: hidden;
      }
      .AddRowView .arvBody {
        flex-grow: 1;
        overflow-y: auto;
      }
      .AddRowView .rows {
        width: 100%;
        border: none;
      }
      .AddRowView .rows-row {
        padding: 0 12px 0 16px;
      }
    */},
    function toInnerHTML() {/*
      <div class="header">
        $$cancel $$accept
        $$q{ extraClassName: 'grow', clearAction: true }
      </div>
      <div class="arvBody" id="%%scrollerID">
        $$filteredDAO{ rowView: this.rowView }
      </div>
      <% this.addInitializer(function() { if (self.allowFocus) self.qView.focus(); }); %>
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
      if (this.allowFocus) this.qView.focus();
    }
  },

  actions: [
    {
      name: 'cancel',
      label: '',
      iconUrl: 'images/ic_clear_24dp.png',
      isAvailable: function() { return !this.selected; },
      code: function() {
        this.doClose();
      }
    },
    {
      name: 'accept',
      label: '',
      iconUrl: 'images/ic_done_24dp.png',
      //keyboardShortcuts: [ 13 /* enter */ ],
      isAvailable: function() { return this.selected; },
      code: function() {
        var key = this.subKey ? this.subKey.f(this.softData) : this.softData;
        this.data = key;
        this.doClose();
      }
    }
  ]
});
