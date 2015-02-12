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
  name: 'LeafDataView',
  package: 'foam.ui',
  extendsModel: 'foam.patterns.ChildTreeTrait',

  documentation: function() {/* For Views that use $$DOC{ref:'.data'},
    but do not pass it along to any children, use this trait.
  */},

  imports: ['data$ as dataImport$'],
      
  properties: [
    {
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
      name: 'data',
      documentation: function() {/* The actual data used by the view. May be set
        directly to override the context import. Children will see changes to this
        data through the context. Override $$DOC{ref:'.onDataChange'}
        instead of using a postSet here. */},
      postSet: function(old, nu) {       
        this.onDataChange(old, nu);
      }
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
    },
    
  ],
  
  methods: {
    onDataChange: function(old, nu) { /* React to a change to $$DOC{ref:'.data'}.
      Don't forget to call <code>this.SUPER(old,nu)</code> in your implementation. */
      this.isImportEnabled_ = this.isImportEnabled_ && this.isContextChange_;
      if ( this.isImportEnabled_ && !equals(this.dataImport, nu) ) {
        this.dataImport = nu;
      }
    },
  }
  
});
