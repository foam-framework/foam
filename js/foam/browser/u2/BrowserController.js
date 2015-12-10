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
  package: 'foam.browser.u2',
  name: 'BrowserController',
  extends: 'foam.u2.View',

  documentation: 'Central controller for a Browser app. Sets up touch and ' +
      'gesture managers, and the stack. Pushes a ' +
      '$$DOC{ref:"foam.browser.u2.BrowserView"} onto the stack. Expects ' +
      '$$DOC{ref:".data"} to be a DAO.',

  requires: [
    'MDAO',
    'foam.browser.u2.BrowserView',
    'foam.browser.u2.StackView',
    'foam.input.touch.GestureManager',
    'foam.input.touch.TouchManager',
    'foam.u2.ElementParser',
    'foam.u2.md.ActionButton',
    'foam.u2.md.Checkbox',
    'foam.u2.md.Input',
    'foam.u2.md.Select',
    'foam.u2.md.SharedStyles',
    'foam.u2.md.TextArea'
  ],

  imports: [
    'gestureManager',
    'touchManager',
  ],
  exports: [
    'data',
    'gestureManager',
    'stack',
    'touchManager',
  ],

  properties: [
    {
      name: 'model',
      adapt: function(_, nu) {
        return typeof nu === 'string' ? this.X.lookup(nu) : nu;
      }
    },
    {
      name: 'data',
      factory: function() {
        // Defaults to an MDAO for our model, if not specified.
        var name = daoize(this.model.name);
        if (this.Y[name]) return this.Y[name];

        var dao = this.MDAO.create({ model: this.model });
        // Export it as fooBarDAO.
        this.Y.set(name, dao);
        return dao;
      }
      // TODO(braden): Maybe we should always export your DAO with the right
      // name, so you don't have to? That might accidentally capture something
      // we didn't intend. It can check if it exists in this.Y before
      // overwriting.
    },
    {
      name: 'touchManager',
      factory: function() {
        return this.TouchManager.create();
      }
    },
    {
      name: 'gestureManager',
      factory: function() {
        return this.GestureManager.create();
      }
    },
    {
      name: 'stack',
      lazyFactory: function() {
        return this.StackView.create();
      }
    },
  ],

  methods: [
    function init() {
      this.ElementParser.create();
      this.SharedStyles.create();
      this.Y.registerModel(this.ActionButton, 'foam.u2.ActionButton');
      this.Y.registerModel(this.Checkbox, 'foam.u2.Checkbox');
      this.Y.registerModel(this.Input, 'foam.u2.Input');
      this.Y.registerModel(this.TextArea, 'foam.u2.TextArea');
      this.Y.registerModel(this.Select, 'foam.u2.Select');
      this.SUPER();
    },
    function initE() {
      this.cls(this.myCls('outer-container')).add(this.stack);
      this.stack.pushView(this.BrowserView.create({
        parent: this,
        model: this.model,
        data$: this.data$
      }, this.Y));
    },
  ]
});
