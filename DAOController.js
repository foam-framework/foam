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
var DAOController = FOAM({
   model_: 'Model',

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
         postSet: function(val) {
           if ( this.scrollBorder && val ) this.scrollBorder.dao = val;
         }
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
         model_: 'Action',
         name:  'new',
         help:  'Create a new record.',

         action:      function() {
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
         model_: 'Action',
         name:  'view',
         help:  'View the current record.',

         action:      function() { }
      },
       */
      {
         model_: 'Action',
         name:  'edit',
         help:  'Edit the current record.',
         default: 'true',

         action:      function() {
            // Todo: fix, should already be connected
            this.selection = this.tableView.selection.get();

            var obj = this.selection;
            var actions = DAOUpdateController.actions.slice(0);

            for ( var i = 0 ; i < this.model.actions.length ; i++ )
            {
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
         model_: 'Action',
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
        this.tableView = TableView.create({ model: model, dao: dao, rows: 30 });
        this.scrollBorder = ScrollBorder.create({ view: this.tableView });
      },

      toHTML: function() {
//       return this.scrollBorder.toHTML();
        return this.scrollBorder.view.toHTML();
      },

      initHTML: function() {
        this.SUPER();
//       this.scrollBorder.initHTML(); // could this just be added to children?
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
         model_: 'Method',

         name: 'onDoubleClick',
         code: function(evt) {
            for ( var i = 0 ; i < this.model_.actions.length ; i++ )
            {
               var action = this.model_.actions[i];

               if ( action.default )
               {
                  action.action.call(this);

                  break;
               }
            }
         }
      },
      {
         model_: 'Method',

         name: 'onSelection',
         code: function(evt) {
            var obj = this.tableView.selection.get();

            if ( obj )
            {
/*
               var view = FOAM({
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
//             view.model = new SimpleValue("");
//             view.model.set(obj);
//             (this.stackView || stack).setPreview(view);

               (this.stackView || stack).setPreview(
                 SummaryView.create({
                   model: this.model,
                   value: this.tableView.selection}));
            }
            else
            {
               (this.stackView || stack).setPreview(null);
            }
         }
      }
   ]

});


var DAOCreateController = FOAM({
   model_: 'Model',

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
         model_: 'Action',
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
         model_: 'Action',
         name:  'cancel',
         help:  'Cancel creation.',

         isAvailable: function() { return true; },
         isEnabled:   function() { return true; },
         action:      function() {
            (this.stackView || stack).back();
         }
      },
      {
         model_: 'Action',
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

        this.view = DetailView2.create({model: this.model, value: new SimpleValue(this.obj)});
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


var DAOUpdateController = FOAM({
   model_: 'Model',

   name:  'DAOUpdateController',
   label: 'DAO Update',

   extendsModel: 'AbstractView',

   properties: [
      {
         name:  'obj',
         label: 'Edited Object',
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
         model_: 'Action',
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
         model_: 'Action',
         name:  'copy',
         help:  'Create a new object which is a copy of this one.',

         isAvailable: function() { return true; },
         isEnabled:   function() { return true; },
         action:      function() {
         }
      },
      {
         model_: 'Action',
         name:  'cancel',
         help:  'Cancel update.',

         isAvailable: function() { return true; },
         isEnabled:   function() { return true; },
         action:      function() {
            (this.stackView || stack).back();
         }
      },
      {
         model_: 'Action',
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
                        view:   'DetailView2'
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
                     },
                     {
                        model_: 'ViewChoice',
                        label:  'UML',
                        view:   'XMLView'
                     },
                     {
                        model_: 'ViewChoice',
                        label:  'Split',
                        view:   'SplitView'
                     }
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


var DAOControllerView = FOAM({
   model_: 'Model',

   extendsModel: 'AbstractView',

   name:  'DAOControllerView',
   label: 'DAOControllerView',

   methods: {

    create: function(model, dao) {
       var ctrl = ActionBorder.create(DAOController, DAOController.create({
          model: model,
          dao:   dao
       }));

       var obj = {
          __proto__: this,
          ctrl:      ctrl,
          model:     model
       };

       return obj;
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

       this.listener = {
         put: function() {
           model.set(this.dao);
         },
         remove: function() {
           model.set(this.dao);
         },
         error: function() {
           console.error(arguments);
         }
       };

       this.dao.listen(this.listener);
       this.ctrl.__proto__.dao = this.dao;
       this.ctrl.scrollBorder.dao = this.dao;
    },

    destroy: function() {
      this.dao.unlisten(this.listener);
    }
   }

});
