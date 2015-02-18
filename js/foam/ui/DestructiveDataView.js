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
  name: 'DestructiveDataView',
  package: 'foam.ui',
  extendsModel: 'foam.patterns.ChildTreeTrait',

  requires: [
    'SimpleValue',
    'foam.patterns.ChainedPrePostProperty'
  ],

  documentation: function() {/* For Views that use $$DOC{ref:'.data'},
    this trait will pseudo-import the data$ reference from the context,
    or allow setting of the $$DOC{ref:'.data'} property directly. Additionally,
    the exported data reference may be cut loose when children are to be
    destroyed, preventing unneeded updates from propagating to them.</p>
    <p><em>Always use the this.$$DOC{ref:'.childX'} context to create child
    views.</em>
  */},

  imports: ['data$ as dataImport$'],

  properties: [
    {
      model_: 'foam.patterns.ChainedPrePostProperty',
      name: 'dataImport',
      documentation: function() {/* Handles the incoming data from the import
        context, and may be ignored if data is directly set. */},
      postSet: function(old, nu) {
        if ( this.isImportEnabled_ && ! equals(this.data, nu) ) {
          this.isContextChange_ = true;
          this.data = nu;
          this.isContextChange_ = false;
        }
      }
    },
    {
      model_: 'foam.patterns.ChainedPrePostProperty',
      name: 'data',
      documentation: function() {/* The actual data used by the view. May be set
        directly to override the context import. Children will see changes to this
        data through the context. */},
      postSet: function(old,nu) {
        /* If not a change from import or export, the user wants to
        set data directly and break the connection with our import */
        this.isImportEnabled_ = this.isImportEnabled_ && this.isContextChange_;
        if ( this.isImportEnabled_ && ! equals(this.dataImport, nu) ) {
          this.dataImport = nu;
        }
        this.onDataChange(old,nu);
      }
    },
    {
      name: 'childDataValue',
      documentation: function() {/* Holds the exported SimpleValue instance.
        The instance will be thrown away and re-created to cut loose any children.
      */}
    },
    {
      name: 'childX',
      documentation: function() {/* The context to use for creating children. */},
      transient: true
    },
    {
      model_: 'BooleanProperty',
      name: 'isContextChange_',
      defaultValue: false,
      transient: true,
      hidden: true
    },
    {
      model_: 'BooleanProperty',
      name: 'isImportEnabled_',
      defaultValue: true,
      hidden: true
    }
  ],

  methods: {

    onChildValueChange: function(old,nu) {
      /* Override to change the default update behavior: when the value
        changes in the child context, propagate into $$DOC{ref:'.data'}. */
      this.data = nu;
    },

    onDataChange: function(old,nu) {
      /* Override to change the default update behavior: when
        $$DOC{ref:'.data'} changes, propagate to the child context. */

      if ( this.shouldDestroy(old,nu) ) {
        // destroy children
        this.destroy();
        // rebuild children with new data (propagation will happen implicitly)
        this.construct();
      } else {
        // otherwise propagate value to existing children
        if (  this.childDataValue
           && ! equals(this.childDataValue.value, nu) ) {
          this.childDataValue.set(nu);
        }
      }

    },

    shouldDestroy: function(old,nu) {
      /* Override to provide the destruct condition. When data changes,
         this method is called. Return true to destroy(), cut loose children
         and construct(). Return false to retain children and just propagate
         the data change. */
      return true;
    },

    destroy: function() {
      // tear down childDataValue listener
      if ( this.childDataValue ) {
        this.childDataValue.removeListener(this.onExportValueChange_);
        this.childDataValue = null;
      }
      this.childX = this.X.sub();

      this.SUPER();
    },
    construct: function() {
      /* Construct new children, and ensure that this.data is propagated to them.
         $$DOC{ref:'.childDataValue'} and $$DOC{ref:'.childX'} are set up here. */
      this.SUPER();
      // create childDataValue value and initialize it
      this.childDataValue = this.SimpleValue.create(this.data);
      this.childDataValue.addListener(this.onExportValueChange_);
      this.childX = this.X.sub({ data$: this.childDataValue });
    }
  },

  listeners: [
    {
      name: 'onExportValueChange_',
      documentation: function() {/* This listener tracks changes to our exported
      value that children may make. */},
      code: function(_,_,old,nu) {
        this.isContextChange_ = true;
        this.onChildValueChange(old,nu);
        this.isContextChange_ = false;
      }
    }
  ]

});
