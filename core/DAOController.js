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
      name:  'model'
    },
    {
      name:  'dao',
      label: 'DAO',
      postSet: function(_, val) {
        if ( this.scrollBorder && val ) this.scrollBorder.dao = val;
        if ( this.searchView && val ) this.searchView.dao = val;
      }
    },
    {
      model_: 'BooleanProperty',
      name: 'useSearchView',
      defaultValue: false
    },
    {
      name: 'searchView'
    }
  ],

  actions: [
    /*
      {
      name:  'toggleView',
      label: 'Table/Detail',
      help:  'Toggle the display format between table and details views.',

      action:      function() {  }
      },*/
    {
      name:  'new',
      help:  'Create a new record.',

      action: function() {
        var createView = ActionBorder.create(
          DAOCreateController,
          DAOCreateController.create({
            model: this.model,
            dao:   this.dao
          }));

        createView.parentController = this;

        // todo: fix
        (this.stackView || stack).pushView(createView, 'New');
      }
    },
    /*
      {
      name:  'view',
      help:  'View the current record.',

      action:      function() { }
      },
    */
    {
      name:  'edit',
      help:  'Edit the current record.',
      default: 'true',

      action: function() {
        // Todo: fix, should already be connected
        this.selection = this.tableView.selection.get();

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
        var updateView = ActionBorder.create(
          actions,
          DAOUpdateController.create({
            obj:   this.selection/*.deepClone()*/,
            model: this.model,
            dao:   this.dao
          }));
        // hack: fix
        (this.stackView || stack).pushView(updateView, 'Edit');
      }
    },
    {
      name:  'delete',
      help:  'Delete the current record.',

      isEnabled: function()   { return this.selected; },
      action: function()      {
        // Todo: fix, should already be connected
        this.selection = this.tableView.selection.get();
        var self = this;
        this.dao.remove(this.selection, {
          // Hack: shouldn't be needed
          remove: function() {
            self.refresh();
          }
        });
      }
    }/*,
       {
       name:  'prev',
       help:  'Select the previous record.',

       action: function()      {  }
       },
       {
       name:  'next',
       help:  'Select the next record.',

       action: function()      {  }
       }*/

  ],

  methods: {
    init: function() {
      var tmp = this.model;
      this.SUPER();
      this.model = tmp;

      var model = this.model;
      var dao = this.dao;
      this.tableView = TableView.create({ model: model, dao: dao, rows: 1000 });
      this.scrollBorder = ScrollBorder.create({ view: this.tableView });
      if ( this.useSearchView && ! this.searchView )  {
        this.searchView = SearchView.create({
          model: this.model,
          dao: this.dao
        });
      }
    },

    toHTML: function() {
      //       return this.scrollBorder.toHTML();
      return (this.useSearchView ? this.searchView.toHTML() : '') +
        this.scrollBorder.view.toHTML();
    },

    initHTML: function() {
      this.SUPER();
      //       this.scrollBorder.initHTML(); // could this just be added to children?
      this.useSearchView && this.searchView.initHTML();
      this.scrollBorder.view.initHTML();

      this.dao = this.dao;
      this.tableView.unsubscribe(this.tableView.DOUBLE_CLICK, this.onDoubleClick);
      this.tableView.subscribe(this.tableView.DOUBLE_CLICK, this.onDoubleClick);
      this.tableView.selection.addListener(this.onSelection);
    },

    refresh: function() {
      this.dao = this.dao;
    }
  },

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
        var obj = this.tableView.selection.get();

        if ( obj ) {
          /*
            FOAModel({
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
            }
            ]
            });
          */
          //             var view = XMLView.create({});
          //             view.rows = 50;
          //             view.cols = 100;
          //             view.model = SimpleValue.create("");
          //             view.model.set(obj);
          //             (this.stackView || stack).setPreview(view);

          (this.stackView || stack).setPreview(
            DetailView.create({
              model: this.model,
              value: this.tableView.selection}));
        }
        else
        {
          // Don't erase selection, just keep last selected
          //               (this.stackView || stack).setPreview(null);
        }
      }
    }
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
            (self.stackView || stack).back();
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
        (this.stackView || stack).back();
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

        // todo: fix
        (this.stackView || stack).pushView(helpView);
        //          (this.stackView || stack).setPreview(helpView, 'Help');
      }
    }
  ],

  methods: {
    newObj: function(obj, dao) {
      var model = {
        __proto__: obj.model_,
        create: function() { return obj; }
      };
      var createView = ActionBorder.create(
        DAOCreateController,
        DAOCreateController.create({
          model: model,
          dao:   dao
        }));

      createView.parentController = this;
      (this.stackView || stack).pushView(createView, 'New');
    },

    init: function() {
      var tmp = this.model;
      this.SUPER();
      this.model = tmp;

      this.obj = this.model.create();

      //        this.view = DetailView2.create({model: this.model, value: SimpleValue.create(this.obj)});
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
            (self.stackView || stack).back();
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
        (this.stackView || stack).back();
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

        // todo: fix
        (this.stackView || stack).pushView(helpView);
        //          (this.stackView || stack).setPreview(helpView, 'Help');
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

      this.view2 = DetailView2.create();

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


FOAModel({
  name:  'DAOControllerView',
  extendsModel: 'AbstractView',

  properties: [
    {
      name: 'model'
    },
    {
      name: 'dao'
    },
    {
      name: 'ctrl',
      valueFactory: function() {
        return ActionBorder.create(DAOController, DAOController.create({
          model: this.model,
          dao: this.dao
        }));
      }
    },
  ],

  label: 'DAOControllerView',

  methods: {

    create: function(model, dao) {
      return this.SUPER({
        model: model,
        dao: dao
      });
    },

    toHTML: function() {
      return this.ctrl.toHTML();
    },

    initHTML: function() {
      //       this.ctrl.tableView.initHTML();
      this.ctrl.initHTML();
    },

    setValue: function(value) {
      // value.get() returns an array which implements DAO
      this.dao = value.get();
      /*
        this.listener = {
        put: function() {
        value.set(this.dao);
        },
        remove: function() {
        value.set(this.dao);
        },
        error: function() {
        console.error(arguments);
        }
        };

        this.dao.listen(this.listener);
      */
      this.ctrl.__proto__.dao = this.dao;
      this.ctrl.scrollBorder.dao = this.dao;
      if ( this.ctrl.searchView ) this.ctrl.searchView.dao = this.dao;
    },

    destroy: function() {
      //    this.dao.unlisten(this.listener);
    }
  }

});
