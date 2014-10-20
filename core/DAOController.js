/**
 * @license
 * Copyright 2013 Google Inc. All Rights Reserved.
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
MODEL({
  name:  'DAOController',
  label: 'DAO Controller',

  extendsModel: 'View',

  properties: [
    {
      model_: 'ModelProperty',
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
      view: 'TableView'
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
      model_: 'BooleanProperty',
      name: 'useSearchView',
      defaultValue: false,
      postSet: function(_, value) {
        if ( value ) {
          this.addDecorator(this.X.SearchBorder.create({
            model: this.model,
            data: this.data
          }));
        }
      },
    }
  ],

  actions: [
    {
      name:  'new',
      help:  'Create a new record.',
      action: function() {
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

      action: function() {
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
      action: function()      {
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
    function toInnerHTML() {/* $$dao{model_: 'TableView', model: this.model}*/}
  ],

  listeners: [
    {
      name: 'onDoubleClick',
      code: function(evt) {
        for ( var i = 0 ; i < this.model_.actions.length ; i++ ) {
          var action = this.model_.actions[i];

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


MODEL({
  name:  'DAOCreateController',
  label: 'DAO Create',

  extendsModel: 'View',

  properties: [
    {
      name:  'model'
    },
    {
      name:  'data',
      label: 'New Object',
      view: 'DetailView',
      factory: function() { return this.model.create(); }
    },
    {
      name:  'dao',
      label: 'DAO',
    }
  ],

  actions: [
    {
      name:  'save',
      label: 'Create',
      help:  'Create a new record.',

      action: function() {
        var self = this;
        this.dao.put(this.data, {
          put: function(value) {
            console.log("Created: ", value);
            self.X.stack.back();
          },
          error: function() {
            console.error("Error creating value: ", arguments);
          }
        });
      }
    },
    {
      name:  'cancel',
      help:  'Cancel creation.',

      action: function() { this.X.stack.back(); }
    },
    {
      name:  'help',
      help:  'View help.',

      action: function() {
        var model = this.data.model_;
        var helpView = this.X.HelpView.create(model);
        this.X.stack.pushView(helpView);
      }
    }
  ],

  templates: [
    function toInnerHTML() {/* $$data */}
  ]
});


MODEL({
  name:  'DAOUpdateController',
  label: 'DAO Update',

  extendsModel: 'View',

  properties: [
    {
      name:  'data',
      label: 'Edited Object'
    },
    {
      name:  'model',
    },
    {
      name:  'dao',
      label: 'DAO',
    }
  ],

  actions: [
    {
      name:  'save',
      help:  'Save updates.',

      action: function() {
        var self = this;
        this.dao.put(this.data, {
          put: function(value) {
            console.log("Created: ", value);
            self.X.stack.back();
          },
          error: function() {
            console.error("Error creating value: ", arguments);
          }
        });
      }
    },
    {
      name:  'copy',
      help:  'Create a new object which is a copy of this one.',

      action: function() {
      }
    },
    {
      name:  'cancel',
      help:  'Cancel update.',

      action: function() {
        this.X.stack.back();
      }
    },
    {
      name:  'help',
      help:  'View help.',

      action: function() {
        var model = this.data.model_;
        var helpView = this.X.HelpView.create(model);
        this.X.stack.pushView(helpView);
      }
    }
  ],

  methods: {
    init: function() {
      this.SUPER();

      this.view = this.X.AlternateView.create({
        selection: 'GUI',
        data: this.data,
        views: [
          {
            model_: 'ViewChoice',
            label:  'GUI',
            view:   'DetailView'
          },
          {
            model_: 'ViewChoice',
            label:  'JS',
            view:   'JSView'
          },
          {
            model_: 'ViewChoice',
            label:  'XML',
            view:   'XMLView'
          }/*,
             {
             model_: 'ViewChoice',
             label:  'UML',
             view:   'XMLView'
             },
             {
             model_: 'ViewChoice',
             label:  'Split',
             view:   'SplitView'
             }*/
        ]
      });
    },

    toHTML: function() {
      return this.view.toHTML();
    },

    initHTML: function() {
      this.SUPER();
      this.view.initHTML();
    }
  }
});


var ArrayView = DAOController;
