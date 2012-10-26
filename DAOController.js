/*
 * Copyright 2012 Google Inc. All Rights Reserved.
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

var ModelAlternateView = FOAM.create({
   model_: 'Model',
   name: 'ModelAlternateView',
   label: 'Model Alternate View',
   extendsModel: 'AlternateView',
   methods: {
      init: function() {
         // TODO: super.init
	 this.views = FOAM.create([
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
	       );
      }
   }
});


var DAOController = FOAM.create({
   model_: 'Model',

   name:  'DAOController',
   label: 'DAO Controller',

   extendsPrototype: 'AbstractView',

   properties: [
      {
	 name:  'selection',
	 label: 'Selection'
      },
      {
	 name:  'model',
	 label: 'Model'
      },
      {
	 name:  'dao',
	 label: 'DAO',
	 postSet: function(val) { if ( this.tableView && val ) this.tableView.setValue(val.asValue()); }
      }
   ],

   actions: [
      /*
      {
	 name:  'toggleView',
	 label: 'Table/Detail',
	 help:  'Toggle the display format between table and details views.',

	 isAvailable: function() { return true; },
	 isEnabled:   function() { return true; },
	 action:      function() {  }
      },*/
      {
         model_: 'ActionModel',
	 name:  'new',
	 label: 'New',
	 help:  'Create a new record.',

	 isAvailable: function() { return true; },
	 isEnabled:   function() { return true; },
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
         model_: 'ActionModel',
	 name:  'view',
	 label: 'View',
	 help:  'View the current record.',

	 isAvailable: function() { return true; },
	 isEnabled:   function() { return true; },
	 action:      function() { }
      },
       */
      {
         model_: 'ActionModel',
	 name:  'edit',
	 label: 'Edit',
	 help:  'Edit the current record.',
	 default: 'true',

	 isAvailable: function() { return true; },
	 isEnabled:   function() { return true; },
	 action:      function() {
	    // Todo: fix, should already be connected
	    this.selection = this.tableView.selection.get();

	    var obj = this.selection;
	    var actions = DAOUpdateController.actions.slice(0);

	    for ( var i = 0 ; i < this.model.actions.length ; i++ )
	    {
	       var action = this.model.actions[i];

	       var newAction = ActionModel.create(action);
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
         model_: 'ActionModel',
	 name:  'delete',
	 label: 'Delete',
	 help:  'Delete the current record.',

	 isAvailable: function() { return true; },
	 isEnabled: function()   { return this.selected; },
	 action: function()      {
	    // Todo: fix, should already be connected
	    this.selection = this.tableView.selection.get();
	    this.dao.remove(this.selection);
	    // Hack: shouldn't be needed
	    this.refresh();
	 }
      }/*,
      {
	 name:  'prev',
	 label: 'Prev',
	 help:  'Select the previous record.',

	 isAvailable: function() { return true; },
	 isEnabled: function()   { return true; },
	 action: function()      {  }
      },
      {
	 name:  'next',
	 label: 'Next',
	 help:  'Select the next record.',

	 isAvailable: function() { return true; },
	 isEnabled: function()   { return true; },
	 action: function()      {  }
      }*/

   ],

   methods: {
      init: function() {
         var tmp = this.model;
	 AbstractView.init.call(this);
	 this.model = tmp;

	 this.tableView = TableView.create(this.model);
      },

      toHTML: function() {
	 return this.tableView.toHTML();
      },

      initHTML: function() {
         AbstractView.initHTML.call(this);
	 this.tableView.initHTML(); // could this just be added to children?

	 this.dao = this.dao;
	 // this.tableView.setModel(this.dao);
	 this.tableView.subscribe(this.tableView.DOUBLE_CLICK, this.onDoubleClick);
	 this.tableView.selection.addListener(this.onSelection);
      },

      refresh: function() {
	 this.tableView.setValue(this.dao.asValue());
      }
   },

   listeners:
   [
      {
	 model_: 'MethodModel',

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
	 model_: 'MethodModel',

	 name: 'onSelection',
	 code: function(evt) {
	    var obj = this.tableView.selection.get();

	    if ( obj )
	    {
/*
	       var view = FOAM.create({
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
//	       var view = XMLView.create({});
//	       view.rows = 50;
//	       view.cols = 100;
//	       view.model = new SimpleValue("");
//	       view.model.set(obj);
//	       (this.stackView || stack).setPreview(view);

	       (this.stackView || stack).setPreview(SummaryView.create(this.tableView.selection));
//	       (this.stackView || stack).setPreview(DetailView.create(obj.model_, new SimpleValue(obj)));
	    }
	    else
	    {
	       (this.stackView || stack).setPreview(null);
	    }
	 }
      }
   ]

});


var DAOCreateController = FOAM.create({
   model_: 'Model',

   name:  'DAOCreateController',
   label: 'Create',

   extendsPrototype: 'AbstractView',

   properties: [
      {
	 name:  'obj',
	 label: 'New Object',
      },
      {
	 name:  'model',
	 label: 'Model',
      },
      {
	 name:  'dao',
	 label: 'DAO',
      }
   ],

   actions: [
      {
         model_: 'ActionModel',
	 name:  'save',
	 label: 'Create',
	 help:  'Create a new record.',

	 isAvailable: function() { return true; },
	 isEnabled:   function() { return true; },
	 action:      function() {
	    this.dao.put(this.obj);
	    console.log("Creating: ", this.obj, this.dao.select());

	    this.stackView.back();
	 }
      },
      {
         model_: 'ActionModel',
	 name:  'cancel',
	 label: 'Cancel',
	 help:  'Cancel creation.',

	 isAvailable: function() { return true; },
	 isEnabled:   function() { return true; },
	 action:      function() {
	    this.stackView.back();
	 }
      },
      {
         model_: 'ActionModel',
	 name:  'help',
	 label: 'Help',
	 help:  'View help.',

	 isAvailable: function() { return true; },
	 isEnabled:   function() { return true; },
	 action:      function() {
	    var model = this.obj.model_;
	    var helpView = HelpView.create(model);

	    // todo: fix
	    (this.stackView || stack).pushView(helpView);
//	    (this.stackView || stack).setPreview(helpView, 'Help');
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
	 AbstractView.init.call(this);
	 this.model = tmp;

	 this.obj = this.model.create();

	 this.view = DetailView2.create(this.model, new SimpleValue(this.obj));
      },

      toHTML: function() {
	return this.view.toHTML();
      },

      initHTML: function() {
	 AbstractView.initHTML.call(this);
	 this.view.initHTML();
      }
   }
});


var DAOUpdateController = FOAM.create({
   model_: 'Model',

   name:  'DAOUpdateController',
   label: 'Update',

   extendsPrototype: 'AbstractView',

   properties: [
      {
	 name:  'obj',
	 label: 'Edited Object',
      },
      {
	 name:  'model',
	 label: 'Model',
      },
      {
	 name:  'dao',
	 label: 'DAO',
      }
   ],

   actions: [
      {
         model_: 'ActionModel',
	 name:  'save',
	 label: 'Save',
	 help:  'Save updates.',

	 isAvailable: function() { return true; },
	 isEnabled:   function() { return true; },
	 action:      function() {
	    this.dao.put(this.obj);

	    console.log("Saving: " + this.obj.toJSON());

	    this.stackView.back();
	 }
      },
      {
         model_: 'ActionModel',
	 name:  'copy',
	 label: 'Copy',
	 help:  'Create a new object which is a copy of this one.',

	 isAvailable: function() { return true; },
	 isEnabled:   function() { return true; },
	 action:      function() {
	 }
      },
      {
         model_: 'ActionModel',
	 name:  'cancel',
	 label: 'Cancel',
	 help:  'Cancel update.',

	 isAvailable: function() { return true; },
	 isEnabled:   function() { return true; },
	 action:      function() {
	    this.stackView.back();
	 }
      },
      {
         model_: 'ActionModel',
	 name:  'help',
	 label: 'Help',
	 help:  'View help.',

	 isAvailable: function() { return true; },
	 isEnabled:   function() { return true; },
	 action:      function() {
	    var model = this.obj.model_;
	    var helpView = HelpView.create(model);

	    // todo: fix
	    (this.stackView || stack).pushView(helpView);
//	    (this.stackView || stack).setPreview(helpView, 'Help');
	 }
      }
   ],

   methods: {

      toHTML: function() {
	 return '<div id="' + this.getID() + '">controller</div>';
      },

      init: function() {
         var tmp = this.model;
	 AbstractView.init.call(this);
	 this.model = tmp;

	 this.view = FOAM.create({
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

      init2: function() {
         var tmp = this.model;
	 AbstractView.init.call(this);
	 this.model = tmp;

	 this.view = DetailView2.create(this.model, new SimpleValue(this.obj));
//	 this.view.set(this);
//	 this.view.set(this.obj);
//	 this.view.updateSubViews();
      },

      toHTML: function() {
	return this.view.toHTML();
      },

      initHTML: function() {
	 AbstractView.initHTML.call(this);
	 this.view.initHTML();
      }
   }
});


//var DAOControllerView = {
//    __proto__: AbstractView,


var DAOControllerView = ModelModel.create({

   extendsModel: 'AbstractView2',

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
       this.dao = ArrayDAO.create(value.get());

       this.dao.subscribe('updated', function() {
         console.log("************", this.dao.arr);
         model.set(this.dao.arr);
       });

       this.ctrl.__proto__.dao = this.dao;
       this.ctrl.tableView.setValue(this.dao.asValue());
    },

    destroy: function() {
    }
   }

});

