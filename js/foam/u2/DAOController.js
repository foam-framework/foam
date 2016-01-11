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
      defaultValueFn: function() {
        return this.data.model;
      }
    },
    {
      name: 'data',
      documentation: 'Usually, you would supply this DAO. If you don\'t, ' +
          '$$DOC{ref:".model"} is required instead.',
    },
    {
      type: 'ViewFactory',
      name: 'listViewFactory',
      defaultValue: 'foam.u2.DAOListView',
    },
    {
      type: 'ViewFactory',
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
        return this.listViewFactory(args2, opt_X);
      }
    },
    {
      type: 'ViewFactory',
      name: 'rowView',
    }
  ],

  listeners: [
    {
      name: 'rowClick',
      code: function(_, _, obj) {
        var Y = this.Y.sub({ data: obj });
        this.stack.pushView(
          this.DAOUpdateController.create({
            model: this.model,
            data: obj
          }, Y));
      }
    }
  ],

  methods: [
    function initE() {
      var list = this.listView(null, this.Y);
      // TODO(adamvy): Do we need to remove the listener ourselves?
      // or can the listView clean it up automatically when removed.
      list.subscribe(list.ROW_CLICK, this.rowClick);
      this.cls(this.myCls()).add(list);
    },
  ]
});
