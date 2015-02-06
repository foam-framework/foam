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
  name: 'DestructiveDataViewTrait',
  package: 'foam.ui',
  
  requires: ['SimpleValue'],
  
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
      name: 'dataImport',
      documentation: function() {/* Handles the incoming data from the import
        context, and may be ignored if data is directly set. */},
      postSet: function(old, nu) {
        if ( this.isImportEnabled_ ) {
          this.isContextChange = true;
          this.data = nu;
          this.isContextChange = false;
        }
      }
    },
    {
      name: 'data',
      documentation: function() {/* The actual data used by the view. May be set
        directly to override the context import. Children will see changes to this
        data through the context. */},
      postSet: function(old, nu) {
        // If not a change from import or export, the user wants to 
        // set data directly and break the connection with our import
        this.isImportEnabled_ = this.isImportEnabled_ && this.isContextChange;
        if ( this.isImportEnabled_ && this.dataImport !== nu ) {
          this.dataImport = nu;
        }
        if (  this.dataExportValue 
           && this.dataExportValue.value !== nu ) {
          this.dataExportValue.set(nu);
        }
      }
    },
    {
      name: 'dataExportValue',
      documentation: function() {/* Holds the exported SimpleValue instance.
        The instance may be thrown away and re-created to cut loose any children. 
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
    
    destroy: function() {
      // tear down dataExportValue listener
      this.dataExportValue.removeListener(this.onExportValueChange);
      this.dataExportValue = null;
      this.childX = this.X.sub();
      
      this.SUPER();
    },
    construct: function() {
      this.SUPER();
      
      // create dataExportValue value and
      this.dataExportValue = this.SimpleValue.create(this.data);
      this.dataExportValue.addListener(this.onExportValueChange);
      this.childX = this.X.sub({ data$: this.dataExportValue });
    }
  },
  
  listeners: [
    {
      name: 'onExportValueChange',
      code: function(_,_,old,nu) {
        this.isContextChange = true;
        this.data = nu;
        this.isContextChange = false;
      }
    }
  ]
  
});
