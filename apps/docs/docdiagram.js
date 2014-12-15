/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
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
  name: 'DocDiagram',
  package: 'foam.documentation'
});


CLASS({
  name: 'ModelDocDiagram',
  extendsModel: 'diagram.Block',
  traits: ['foam.views.DataConsumerTrait', 
           'foam.views.DataProviderTrait',
           'foam.views.ChildTreeTrait'], // TODO(jacksonic): put child tree trait into CView 
  
  requires: [
    'diagram.Section',
    'diagram.SectionGroup'
  ],
  
  documentation: function() {/*
    A diagram block documenting one $$DOC{ref:'Model'}.
  */},
    
  methods:{
    propagateParentChange: function(old, nu) {
      // clean up children 
      this.destroy();

      // pass data on
      this.SUPER(old,nu);
      
      // re-create children
      this.processModelChange();      
    },
    
    processModelChange: function() { /* Template Method. Override to iterate over features and 
      build sections for them. */
      //TODO(jacksonic): Use featureDAO
      
      // properties
      
      
    }
  }
});




 
 
 
