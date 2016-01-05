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
  package: 'foam.u2',
  name: 'DAOUpdateController',
  extends: 'foam.u2.View',

  documentation: 'Expects $$DOC{ref:".data"} to be either: (a) the object to ' +
      'view, or (b) the ID to view. Either way, this will do a find.',

  requires: [
    'foam.persistence.ObjectReplicator',
    'foam.u2.md.DetailView',
    'foam.u2.md.Toolbar',
    'foam.u2.md.ToolbarAction'
  ],

  imports: [
    'document',
    'stack'
  ],

  exports: [
    'myControllerMode as controllerMode'
  ],

  properties: [
    'model',
    {
      name: 'data',
      postSet: function(old, nu) {
        this.body_.removeAllChildren();
        var replicator = this.ObjectReplicator.create({
          dao: this.dao,
          model: this.dao.model,
          id: nu.id || nu
        });
        replicator.future.get(function(obj) {
          this.body_.add( ( obj && obj.toE ) ? obj.toE(this.Y) : this.DetailView.create({ data: obj }) );
        }.bind(this));
      },
    },
    {
      name: 'dao',
      factory: function() {
        return this.X[daoize(this.model.name)];
      }
    },
    {
      name: 'title',
      factory: function() {
        return 'Edit ' + this.data.model_.name;
      }
    },
    {
      name: 'body_',
      factory: function() {
        return this.Y.E('div').cls(this.myCls('body'));
      }
    },
    {
      name: 'toolbar_',
      factory: function() {
        var t = this.Toolbar.create({ title$: this.title$ });
        t.addLeftActions([
          this.ToolbarAction.create({ data: this, action: this.BACK }),
        ]);
        t.addRightActions([
          this.ToolbarAction.create({ data: this, action: this.DELETE })
        ]);
        return t;
      }
    },
    ['myControllerMode', 'update']
  ],

  actions: [
    {
      name: 'back',
      ligature: 'arrow_back',
      code: function() {
        var active = this.document.activeElement;
        active && active.blur();
        // The blur above might have triggered data to update, so we call
        // doBack(), which is framed. That gives the data time to settle.
        this.doBack();
      }
    },
    {
      name: 'delete',
      ligature: 'delete',
      code: function() {
        this.dao.remove(this.data.id, {
          remove: function() {
            this.stack.popView();
          }.bind(this),
          error: function() {
            // TODO:
          }
        });
      }
    }
  ],

  listeners: [
    {
      name: 'doBack',
      framed: true,
      code: function() { this.stack.popView(); }
    }
  ],

  methods: [
    function initE() {
      this.cls(this.myCls()).add(this.toolbar_).add(this.body_);
    }
  ],

  templates: [
    function CSS() {/*
      ^ {
        display: flex;
        flex-direction: column;
        height: 100%;
        width: 100%;
      }

      ^body {
        overflow-x: hidden;
        overflow-y: auto;
      }
    */}
  ]
});
