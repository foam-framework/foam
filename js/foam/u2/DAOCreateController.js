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
  name: 'DAOCreateController',
  extends: 'foam.u2.View',
  documentation: 'Expects $$DOC{ref:".model"} to be set. This will construct ' +
      'a new instance of the model, and render a DetailView for it.',

  requires: [
    //'foam.u2.md.DetailView', Circular dependency
    'foam.u2.md.Toolbar',
    'foam.u2.md.ToolbarAction',
  ],

  imports: [
    'document',
    'stack',
  ],

  exports: [
    'myControllerMode as controllerMode'
  ],

  properties: [
    'model',
    {
      name: 'title',
      factory: function() { return 'New ' + this.model.name; }
    },
    {
      name: 'data',
      lazyFactory: function() {
        return this.model.create(null, this.Y);
      }
    },
    {
      name: 'body_',
      factory: function() {
        return this.Y.E('div').cls(this.myCls('body'))
            .add( ( this.data && this.data.toE ) ? this.data.toE(this.Y) : 
              this.X.lookup('foam.u2.md.DetailView').create({
                model: this.model,
                data$: this.data$,
              }, this.Y)
            );
      }
    },
    {
      name: 'toolbar_',
      factory: function() {
        var t = this.Toolbar.create({ title$: this.title$ });
        t.addLeftActions([
          this.ToolbarAction.create({ data: this, action: this.CANCEL })
        ]);
        t.addRightActions([
          this.ToolbarAction.create({ data: this, action: this.SAVE })
        ]);
        return t;
      }
    },
    {
      name: 'dao',
      factory: function() {
        return this.X[daoize(this.model.name)];
      }
    },
    ['myControllerMode', 'create']
  ],

  actions: [
    {
      name: 'cancel',
      ligature: 'clear',
      code: function() {
        this.stack.popView();
      }
    },
    {
      name: 'save',
      ligature: 'check',
      code: function() {
        var active = this.document.activeElement;
        active && active.blur();
        // Framed to allow any last-second data updates to propagate.
        // They might be caused by the blur above, and we want to wait for the
        // data to propagate.
        this.doBack();
      }
    },
  ],

  listeners: [
    {
      name: 'doBack',
      framed: true,
      code: function() {
        this.dao.put(this.data, {
          put: function() {
            this.stack.popView();
          }.bind(this)
        });
      }
    },
  ],


  methods: [
    function initE() {
      this.cls(this.myCls()).add(this.toolbar_).add(this.body_);
    },
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
    */},
  ]
});
