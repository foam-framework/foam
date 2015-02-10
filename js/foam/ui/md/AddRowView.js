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
  extendsModel: 'View',
  traits: ['PositionedDOMViewTrait', 'VerticalScrollNativeTrait'],

  requires: [
    'foam.ui.md.ToolbarCSS'
  ],

  imports: [
    'queryFactory',
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
      extendsModel: 'ProxyDAO',
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
      name: 'data',
      postSet: function(old, nu) {
        console.log('data', old, nu);
        this.q = nu;
      }
    },
    {
      name: 'q',
      label: 'Search users',
      view: {
        factory_: 'foam.ui.md.TextFieldView',
        onKeyMode: true,
        floatingLabel: false
      },
      postSet: function(old, nu) {
        console.log('q', old, nu);
      }
    },
    {
      model_: 'DAOProperty',
      name: 'dao',
    },
    {
      name: 'wrappedDAO',
      factory: function() {
        console.log('hide on single', this.hideListOnSingle);
        return this.hideListOnSingle ?
            this.SingleEntryHidingDAO.create({ delegate: this.dao }) : this.dao;
      }
    },
    {
      model_: 'DAOProperty',
      name: 'filteredDAO',
      dynamicValue: function() {
        console.log('filteredDAO update');
        this.q; this.wrappedDAO; this.limit;
        var q = this.q ? this.queryFactory(this.q) : TRUE;
        var dao = this.wrappedDAO.where(q).limit(this.limit);
        dao.select(COUNT())(console.log.json);
        return dao;
      },
      view: {
        factory_: 'DAOListView',
        className: 'rows',
        tagName: 'div',
        useSelection: true
      }
    },
    {
      name: 'queryFactory',
      defaultValue: TRUE
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
      name: 'bodyId',
      factory: function() { return this.nextID(); }
    },
    {
      name: 'scrollerID',
      factory: function() { return this.nextID(); }
    },
    {
      name: 'hideListOnSingle',
      documentation: 'When true (the default), the suggestion list disappears when there is only one match. When false it is always visible.',
      defaultValue: true
    },
    {
      name: 'selection',
      postSet: function(old, nu) {
        if (nu) {
          this.data = nu.id;
          this.doClose();
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
        $$close $$cancel
        $$q{ extraClassName: 'grow', clearAction: true }
      </div>
      <div class="arvBody" id="%%bodyId">
        $$filteredDAO{ rowView: this.rowView }
      </div>
    */}
  ],

  methods: {
    doClose: function() {
      // Don't close twice.
      if ( this.closed_ ) return;
      this.closed_ = true;

      this.stack.back();
    }
  },

  actions: [
    {
      name: 'close',
      label: '',
      iconUrl: 'images/ic_arrow_back_24dp.png',
      isAvailable: function() { return this.q === this.data; },
      action: function() {
        this.doClose();
      }
    },
    {
      name: 'cancel',
      label: '',
      iconUrl: 'images/ic_clear_24dp.png',
      isAvailable: function() { return this.q !== this.data; },
      action: function() {
        this.doClose();
      }
    },
    {
      name: 'accept',
      keyboardShortcuts: [ 13 /* enter */ ],
      action: function() {
        this.data = this.q;
        this.doClose();
      }
    }
  ]
});
