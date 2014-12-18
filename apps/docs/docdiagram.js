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
  name: 'DocDiagramTrait',
  package: 'foam.documentation',
  // enhances BaseDetailView to add diagram support
  
  requires: [
    'diagram.Section',
    'diagram.SectionGroup'
  ],
  
  properties: [
    {
      name: 'diagramItems',
      documentation: "The diagram item we create and are managing.",
      type: 'diagram.DiagramItemTrait[]'
    }
  ]
});


CLASS({
  name: 'ModelDocDiagram',
  extendsModel: 'foam.views.BaseDetailView',
  package: 'foam.documentation',
  traits: ['foam.documentation.DocDiagramTrait',
           'foam.documentation.DocModelFeatureDAOTrait'], 
    
  documentation: function() {/*
    A diagram block documenting one $$DOC{ref:'Model'}.
  */},
  
  methods: {

    construct: function() {
      
    },
    destroy: function() {
      
    },
    
    onValueChange_: function() {
      this.processModelChange();
    },

    processModelChange: function() {
      // abort if it's too early //TODO: (we import data and run its postSet before the rest is set up)
      if (!this.featureDAO || !this.modelDAO) return;
      this.generateFeatureDAO(this.data);
    },



  }
});




 
 
 
