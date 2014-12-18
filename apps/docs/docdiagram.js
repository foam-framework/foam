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
    
  properties: [
    {
      name: 'diagramItem',
      documentation: "The diagram item we create and are managing.",
      type: 'diagram.DiagramItemTrait'
    }
  ],
  
  methods: {
    destroy: function() {
      this.diagramItem.destroy();
      this.diagramItem.parent = undefined;

      this.diagramItem = undefined;
      
      this.SUPER();
    }
  }
});


CLASS({
  name: 'ModelDocDiagram',
  extendsModel: 'foam.views.BaseDetailView',
  package: 'foam.documentation',
  traits: ['foam.documentation.DocDiagramTrait',
           'foam.documentation.DocModelFeatureDAOTrait'], 
    
  requires: ['diagram.Block'],
    
  documentation: function() {/*
    A diagram block documenting one $$DOC{ref:'Model'}.
  */},
  
  methods: {
    construct: function() {
      this.diagramItem = this.Block.create({ title: this.featureType });
      
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

CLASS({
  name: 'FeatureListDiagram',
  package: 'foam.documentation',
  
  requires: ['foam.documentation.FeatureDiagram'],
  
  traits: [ 'foam.views.ChildTreeTrait',
            'foam.views.DataConsumerTrait',
            'foam.views.DataProviderTrait',
            'foam.documentation.DocDiagramTrait',
            'foam.documentation.FeatureListLoaderTrait',
            'foam.views.DAODataTrait'],

  documentation: function() {/*
    Renders a feature list (such as $$DOC{ref:'Model.properties'}, $$DOC{ref:'Model.methods'}, etc.) into
    a diagram.
  */},

  methods: {
    onDAOUpdate: function() {
      this.destroy();
      this.construct();
    },
    
    construct: function() {
      this.diagramItem = this.SectionGroup.create({ title: this.featureType });
      
      this.selfFeaturesDAO.select({ put: function(item) {
        var X = this.childX.sub({ data$: this.childX.SimpleValue.create(o, this.childX) });
        this.addChild(this.FeatureDiagram.create({ model: o.model_ }, X));
      }.bind(this)});
    },
  
    addChild: function(child) {
      this.SUPER(child);
      // add diagram node of the child to ours
      if ( this.diagramItem && child.diagramItem ) this.diagramItem.addChild(child.diagramItem);
    },
    removeChild: function(child) {
      this.SUPER(child);
      if ( this.diagramItem &&  child.diagramItem ) this.diagramItem.removeChild(child.diagramItem);
    }
  }
  
});

CLASS({
  name: 'FeatureDiagram',
  package: 'foam.documentation',
  
  traits: [ 'foam.views.ChildTreeTrait',
            'foam.views.DataConsumerTrait',
            'foam.views.DataProviderTrait',
            'foam.documentation.DocDiagramTrait'],
  
  requires: ['diagram.Section'],
  
  documentation: function() {/*
    The base model for feature-specific diagrams. Use PropertyFeatureDiagram,
    MethodFeatureDiagram, etc. as needed to diagram a feature.
  */},
  
  properties: [
    {
      name: 'data',
      postSet: function() {
        this.diagramItem.title = this.data.name;
      }
    }
  ],
  
  construct: function() {
    this.diagramItem = this.Section.create({ title: this.data.name });
  }
});

 
 
 
