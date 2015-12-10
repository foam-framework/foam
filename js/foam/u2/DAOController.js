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
  name: 'DAOController',
  extends: 'foam.u2.View',
  documentation: 'Expects a DAO as $$DOC{ref:".data"}. Renders a ' +
      '$$DOC{ref:".listView"} of $$DOC{ref:".rowView", plural:true} for it. ' +
      'Supports editing and creating new views through the ' +
      '$$DOC{ref:"foam.u2.DAOUpdateController"} and ' +
      '$$DOC{ref:"foam.u2.DAOCreateController"}.',

  requires: [
    'foam.u2.DAOUpdateController',
    'foam.u2.DAOListView',
  ],

  imports: [
    'stack',
  ],

  properties: [
    {
      name: 'model',
      lazyFactory: function() {
        return this.data.model;
      }
    },
    {
      name: 'data',
      documentation: 'Usually, you would supply this DAO. If you don\'t, ' +
          '$$DOC{ref:".model"} is required instead.',
    },
    {
      name: 'selection',
      postSet: function(old, nu) {
        if (nu) {
          var Y = this.Y.sub({ data: nu });
          this.stack.pushView(this.DAOUpdateController.create({ model: this.model, data: nu }, Y));
        }
      },
    },
    {
      model_: 'ViewFactoryProperty',
      name: 'listView',
      defaultValue: function(args, opt_X) {
        var args2 = {};
        Object_forEach(args, function(v, k) {
          args2[k] = v;
        });
        args2.rowView = args2.rowView || this.rowView;
        args2.minWidth = args2.minWidth || 350;
        args2.preferredWidth = args2.preferredWidth || 500;
        args2.maxWidth = args2.maxWidth || 500;
        args2.data$ = this.data$;
        return this.DAOListView.create(args2, opt_X);
      }
    },
    {
      model_: 'ViewFactoryProperty',
      name: 'rowView',
      defaultValue: 'foam.u2.md.CitationView',
    },
    {
      name: 'stack',
      postSet: function(old, nu) {
        old && old.unsubscribe(old.VIEW_DESTROYED, this.onViewDestroyed);
        nu && nu.subscribe(nu.VIEW_DESTROYED, this.onViewDestroyed);
      },
    },
  ],

  listeners: [
    {
      name: 'onViewDestroyed',
      documentation: 'Called when the child view (detail view) is closed.',
      code: function(sender, topic, view) {
        if (view.data && this.selection && view.data.id === this.selection.id) {
          this.selection = null;
        }
      }
    },
  ],

  methods: [
    function initE() {
      var Y = this.Y.sub({ selection$: this.selection$ });
      this.cls(this.myCls()).add(this.listView(null, Y));
    },
  ]
});
