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
FOAModel({
  name:  'DAOController',
  label: 'DAO Controller',

  extendsModel: 'AbstractView',

  properties: [
    {
      name:  'selection'
    },
    {
      name:  'model',
      postSet: function(_, model) {
        // TODO: Is this the best way to pass the model to the TableView?
        this.X.model = model;
      }
    },
    {
      model_: 'DAOProperty',
      name:  'dao',
      label: 'DAO',
      view: 'TableView',
      postSet: function(_, dao) {
        // TODO Is this going to be useful?
        this.X.DAO = dao;
      }
    },
    {
      name:  'value',
      help: 'Alias value property to set the dao.',
      postSet: function(old, value) {
        old && old.removeListener(this.onValueChange);
        value.addListener(this.onValueChange);
        this.onValueChange();
      }
    },
    {
      model_: 'BooleanProperty',
      name: 'useSearchView',
      defaultValue: false,
      postSet: function(_, value) {
        if ( value ) {
          this.addDecorator(SearchBorder.create({
            model: this.model,
            dao: this.dao
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
        var createView = DAOCreateController.create({
          model: this.model,
          dao:   this.dao
        }).addDecorator(ActionBorder.create({
          actions: DAOCreateController.actions,
        }));

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
        this.selection = this.daoView.selection.get();

        var obj = this.selection;
        var actions = DAOUpdateController.actions.slice(0);

        for ( var i = 0 ; i < this.model.actions.length ; i++ ) {
          var action = this.model.actions[i];

          var newAction = Action.create(action);
          newAction.action = function (oldAction) {
            return function()
            {
              oldAction.call(obj);
            };
          }(action.action);

          actions.push(newAction);
        }

        console.log(["selection: ", this.selection]);
        var updateView = DAOUpdateController.create({
          obj:   this.selection/*.deepClone()*/,
          model: this.model,
          dao:   this.dao
        }).addDecorator(ActionBorder.create({
          actions: DAOUpdateController.actions,
        }));

        this.X.stack.pushView(updateView, 'Edit');
      }
    },
    {
      name:  'delete',
      help:  'Delete the current record.',

//      isEnabled: function()   { return this.selection; },
      action: function()      {
        // Todo: fix, should already be connected
        this.selection = this.daoView.selection.get();
        var self = this;
        this.dao.remove(this.selection, {
          // Hack: shouldn't be needed
          remove: function() {
            self.refresh();
          }
        });
      }
    }
  ],

  methods: {
    initHTML: function() {
      this.SUPER();
      this.daoView.unsubscribe(this.daoView.DOUBLE_CLICK, this.onDoubleClick);
      this.daoView.subscribe(this.daoView.DOUBLE_CLICK, this.onDoubleClick);
      this.daoView.selection.addListener(this.onSelection);
    },

    refresh: function() {
      this.dao = this.dao;
    }
  },

  templates: [
    {
      name: 'toHTML',
      template: '$$dao'
    }
  ],

  listeners:
  [
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
        var obj = this.daoView.selection.get();
        if ( ! obj ) return;

        this.X.stack.setPreview(
          DetailView.create({
            model: this.model,
            value: this.daoView.selection
          }));
      }
    },
    {
      name: 'onValueChange',
      code: function() {
        this.dao = this.value.value;
      }
    },
  ]
});


FOAModel({
  name:  'DAOCreateController',
  label: 'DAO Create',

  extendsModel: 'AbstractView',

  properties: [
    {
      name:  'obj',
      label: 'New Object',
    },
    {
      name:  'model'
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

      isAvailable: function() { return true; },
      isEnabled:   function() { return true; },
      action:      function() {
        var self = this;
        this.dao.put(this.obj, {
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

      isAvailable: function() { return true; },
      isEnabled:   function() { return true; },
      action:      function() {
        this.X.stack.back();
      }
    },
    {
      name:  'help',
      help:  'View help.',

      isAvailable: function() { return true; },
      isEnabled:   function() { return true; },
      action:      function() {
        var model = this.obj.model_;
        var helpView = HelpView.create(model);
        this.X.stack.pushView(helpView);
      }
    }
  ],

  methods: {
    newObj: function(obj, dao) {
      // TODO is this ever called?
      debugger;
      var model = {
        __proto__: obj.model_,
        create: function() { return obj; }
      };
      var createView = DAOCreateController.create({
        model: model,
        dao:   dao
      }).addDecorator(ActionBorder.create({ actions: DAOCreateController.actions }));

      createView.parentController = this;
      this.X.stack.pushView(createView);
    },

    init: function() {
      var tmp = this.model;
      this.SUPER();
      this.model = tmp;

      this.obj = this.model.create();

      this.view = DetailView.create({model: this.model, value: this.propertyValue('obj')});
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


FOAModel({
  name:  'DAOUpdateController',
  label: 'DAO Update',

  extendsModel: 'AbstractView',

  properties: [
    {
      name:  'obj',
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

      isAvailable: function() { return true; },
      isEnabled:   function() { return true; },
      action:      function() {
        var self = this;
        var obj = this.obj;
        this.dao.put(obj, {
          put: function() {
            console.log("Saving: ", obj.toJSON());
            
            self.X.stack.back();
          },
          error: function() {
            console.error("Error saving", arguments);
          }
        });
      }
    },
    {
      name:  'copy',
      help:  'Create a new object which is a copy of this one.',

      isAvailable: function() { return true; },
      isEnabled:   function() { return true; },
      action:      function() {
      }
    },
    {
      name:  'cancel',
      help:  'Cancel update.',

      isAvailable: function() { return true; },
      isEnabled:   function() { return true; },
      action:      function() {
        this.X.stack.back();
      }
    },
    {
      name:  'help',
      help:  'View help.',

      isAvailable: function() { return true; },
      isEnabled:   function() { return true; },
      action:      function() {
        var model = this.obj.model_;
        var helpView = HelpView.create(model);
        this.X.stack.pushView(helpView);
      }
    }
  ],

  methods: {

    toHTML: function() {
      return '<div id="' + this.getID() + '">controller</div>';
    },

    init: function() {
      var tmp = this.model;
      this.SUPER();
      this.model = tmp;

      this.view = FOAM({
        model_: 'AlternateView',

        selection: 'GUI',
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

      this.view.value.set(this.obj);
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
