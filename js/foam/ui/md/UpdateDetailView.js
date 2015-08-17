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
  package: 'foam.ui.md',
  name: 'UpdateDetailView',
  extendsModel: 'foam.ui.md.DetailView',

  requires: [
    'foam.ui.PopupChoiceView',
    'foam.ui.md.Toolbar'
  ],

  imports: [
    'dao',
    'stack'
  ],
  exports: [
    'toolbar$'
  ],

  properties: [
    {
      name: 'rawData',
      documentation: 'The uncloned original input data.',
      postSet: function(old, nu) {
        if ( old ) old.removeListener(this.rawUpdate);
        if ( nu ) nu.addListener(this.rawUpdate);
      }
    },
    {
      name: 'originalData',
      documentation: 'A clone of the input data, for comparison with edits.'
    },
    {
      name: 'data',
      preSet: function(_, v) {
        if ( ! v ) return undefined;
        this.rawData = v;
        return v.deepClone();
      },
      postSet: function(_, data) {
        if ( ! data ) return;
        this.originalData = data.deepClone();
        if ( data && data.model_ ) this.model = data.model_;
        var self = this;
        data.addPropertyListener(null, function(o, topic) {
          var prop = o.model_.getProperty(topic[1]);
          if ( prop.transient ) return;
          self.version++;
          self.rawData = '';
        });
      }
    },
    {
      name: 'immutable',
      documentation: 'Set to true if the view should never switch to ' +
          'X-and-check mode, even when there are changes.',
      defaultValue: false
    },
    {
      name: 'liveEdit',
      documentation: "Propagate edits immediately, and don't show the save button",
      defaultValue: false
    },
    {
      name: 'exitOnSave',
      documentation: "If true, saving will also exit the view.",
      defaultValue: false
    },
    {
      // Version of the data which changes whenever any property of the data is updated.
      // Used to help trigger isEnabled / isAvailable in Actions.
      model_: 'IntProperty',
      name: 'version'
    },
    {
      model_: 'BooleanProperty',
      name: 'showModelActions',
      defaultValue: true
    },
    {
      model_: 'BooleanProperty',
      name: 'outstandingChanges',
      hidden: true,
      dynamicValue: function() {
        this.version; this.immutable;
        return ! this.immutable && ! this.originalData.equals(this.data);
      },
      postSet: function(old,nu) {
        if ( nu && this.liveEdit ) {
          this.onCommit();
        }
      }
    },
    {
      model_: 'FunctionProperty',
      name: 'noChanges',
      defaultValue: null,
      dynamicValue: function() { return ! this.outstandingChanges; }
    },
    {
      type: 'foam.ui.md.Toolbar',
      name: 'toolbar',
      lazyFactory: function() {
        return this.Toolbar.create({
          data$: this.data$,
          title$: this.title$
        }, this.Y);
      },
      postSet: function(old, nu) {
        if ( old === nu ) return;
        if ( old ) {
          Events.unfollow(this.noChanges$, old.back.available$);
          Events.unfollow(this.outstandingChanges$, old.reset.available$);
          Events.unfollow(this.outstandingChanges$, old.commit.available$);
        }
        if ( nu ) {
          nu.back.code = this.onBack;
          nu.reset.code = this.onReset;
          nu.commit.code = this.onCommit;
          nu.menu.available = false;
          Events.follow(this.noChanges$, nu.back.available$);
          Events.follow(this.outstandingChanges$, nu.reset.available$);
          Events.follow(this.outstandingChanges$, nu.commit.available$);
        }
      },
    },
    {
      model_: 'ViewFactoryProperty',
      name: 'innerView',
      defaultValue: 'foam.ui.md.DetailView'
    },
    {
      name: 'className',
      defaultValue: 'md-update-detail-view'
    }
  ],

  listeners: [
    {
      name: 'rawUpdate',
      code: function() {
        // If this listener fires, the raw data updated and the user hasn't
        // changed anything.
        this.data = this.rawData;
      }
    },
    {
      name:  'onCommit',
      help:  'Save updates.',
      code: function() {
        var self = this;
        var obj  = this.data;

        this.dao.put(obj, {
          put: function() {
            self.originalData = obj.deepClone();

            if (self.exitOnSave && ! self.liveEdit) {
              self.stack.popView();
            }
          },
          error: function() {
            console.error('Error saving', arguments);
          }
        });
      }
    },
    {
      name:  'onBack',
      help:  'Go back.',
      code: function() {
        this.stack.popView();
      }
    },
    {
      name: 'onReset',
      help: 'Reset form (cancel update).',
      code: function() {
        this.data = this.originalData.deepClone();
      }
    }
  ],

  templates: [
    function CSS() {/*
      .md-update-detail-view {
        display: flex;
        flex-direction: column;
        height: 100%;
        width: 100%;
      }
      .md-update-detail-view-body {
        overflow-x: hidden;
        overflow-y: auto;
        //width: 100%;
        display: flex;

      }
    */},
    function toHTML() {/*
      <div id="<%= this.id %>" <%= this.cssClassAttr() %>>
        %%toolbar
        <div class="md-update-detail-view-body">
          <%= this.innerView({ data$: this.data$ }, this.Y) %>
        </div>
      </div>
    */}
  ]
});
