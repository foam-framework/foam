/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved
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
  package: 'foam.ui',
  name:  'DAOController',
  label: 'DAO Controller',

  extends: 'foam.ui.View',

//  requires: ['foam.ui.search.SearchBorder'],

  properties: [
    {
      type: 'Model',
      name: 'model'
    },
    {
      name: 'subType',
      setter: function(v) {
        this.model = v;
      }
    },
    {
      name: 'dao',
      view: 'foam.ui.TableView'
    },
    {
      name: 'data',
      setter: function(v) {
        this.dao = v;
      },
      getter: function() {
        return this.dao;
      }
    },
    {
      name: 'selection'
    },
    {
      type: 'Boolean',
      name: 'useSearchView',
      defaultValue: false/*,
      postSet: function(_, value) {
        if ( value ) {
          this.addDecorator(this.SearchBorder.create({
            model: this.model,
            data: this.data
          }));
        }
      }*/
    }
  ],

  actions: [
    {
      name:  'new',
      help:  'Create a new record.',
      code: function() {
        var createView = this.X.DAOCreateController.create({
          model: this.model,
          dao:   this.dao,
          showActions: true
        });

        createView.parentController = this;

        this.X.stack.pushView(createView, 'New');
      }
    },
    {
      name:  'edit',
      help:  'Edit the current record.',
      default: 'true',

      code: function() {
        // Todo: fix, should already be connected
        this.selection = this.daoView.selection;

        var obj = this.selection;
        var actions = this.X.DAOUpdateController.actions.slice(0);

        for ( var i = 0 ; i < this.model.actions.length ; i++ ) {
          var action = this.model.actions[i];

          var newAction = this.X.Action.create(action);
          newAction.action = function (oldAction) {
            return function() {
              oldAction.call(obj);
            };
          }(action.action);

          actions.push(newAction);
        }

        console.log(["selection: ", this.selection]);
        var updateView = this.X.DAOUpdateController.create({
          data:  this.selection/*.deepClone()*/,
          model: this.model,
          dao:   this.dao,
          showActions: true
        });

        this.X.stack.pushView(updateView, 'Edit');
      }
    },
    {
      name:  'delete',
      help:  'Delete the current record.',

//      isEnabled: function()   { return this.selection; },
      code: function()      {
        // Todo: fix, should already be connected
        this.selection = this.daoView.selection;
        var self = this;
        this.dao.remove(this.selection);
      }
    }
  ],

  methods: {
    init: function() {
      this.SUPER();
      this.showActions = true;
    },
    initHTML: function() {
      this.SUPER();
      this.daoView.subscribe(this.daoView.DOUBLE_CLICK, this.onDoubleClick);
      this.daoView.selection$.addListener(this.onSelection);
    }
  },

  templates: [
    function toInnerHTML() {/* $$dao{ model: this.model } */}
  ],

  listeners: [
    {
      name: 'onDoubleClick',
      code: function(evt) {
        for ( var i = 0 ; i < this.model_.getRuntimeActions().length ; i++ ) {
          var action = this.model_.getRuntimeActions()[i];

          if ( action.default ) {
            action.action.call(this);
            break;
          }
        }
      }
    },
    {
      name: 'onSelection',
      code: function(evt) {
        var obj = this.daoView.selection;
        if ( ! obj ) return;

        this.X.stack.setPreview(
          this.X.SummaryView.create({
            model: this.model,
            data: this.daoView.selection
          }));
      }
    }
  ]
});
