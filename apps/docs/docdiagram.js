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
    // destroy: function() {
    //   if ( this.diagramItem ) {
    //     this.diagramItem.destroy();
    //     this.diagramItem.parent = undefined;
    //
    //     this.diagramItem = undefined;
    //   }
    //   this.SUPER();
    // }
  }
});

CLASS({
  name: 'DocDiagramView',
  extendsModel: 'CViewView',
  package: 'foam.documentation',
  
  traits: [ 'foam.views.ChildTreeTrait',
            'foam.views.DataConsumerTrait'],
  
  requires: ['foam.documentation.ModelDocDiagram',
             'diagram.LinearLayout'],
  
  documentation: function() {/*
    A view that renders one model's diagram.
  */},
  
  properties: [
    {
      name: 'mainLayout',
      type: 'diagram.LinearLayout',
      factory: function() {
        return this.LinearLayout.create();
      }
    },
    {
      name: 'modelDiagram',
      factory: function() {
        var modelDiagram = this.ModelDocDiagram.create();
        this.mainLayout.addChild(modelDiagram.diagramItem);
        return modelDiagram;
      }
    }
  ],
  
  methods: {
    init: function() {
      this.SUPER();
      this.cview = this.mainLayout;
      this.mainLayout.x = 0;
      this.mainLayout.y = 0;
      this.mainLayout.width = 300;
      this.mainLayout.height = 250;
    },
    
    toHTML: function() {
      this.destroy();
      ret = this.SUPER();
      this.construct();
      return ret;
    },
    
    destroy: function() {
      //if ( this.modelDiagram && this.modelDiagram.diagramItem ) this.mainLayout.removeChild(this.modelDiagram.diagramItem);
      //this.modelDiagram = undefined;
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
    
  requires: ['diagram.Block',
             'diagram.Section',
             'foam.documentation.FeatureListDiagram'],
    
  documentation: function() {/*
    A diagram block documenting one $$DOC{ref:'Model'}.
  */},
  
  properties: [
    {
      name: 'modelName',
      type: 'String'
    },
    {
      name: 'diagramItem',
      factory: function() {
        var diagramItem = this.Block.create({}, this.childX);
        diagramItem.addChild(
          this.Section.create({
            title$: this.modelName$, titleFont: 'bold 16px Roboto'
          }, this.childX)
        );
        return diagramItem;
      }
    }
  ],
  
  methods: {
    
    construct: function() {
      this.SUPER();
      this.createTemplateView('properties', { model_: 'foam.documentation.FeatureListDiagram', 
            model: this.X.Property, featureType:'properties' });
      //this.addChild(this.FeatureListDiagram.create({ model: this.X.Property, featureType:'properties' }, this.childX));
    },
    
    onValueChange_: function() {
      if (this.data) this.modelName = this.data.name;
      this.processModelChange();
    },

    processModelChange: function() {
      // abort if it's too early //TODO: (we import data and run its postSet before the rest is set up)
      if (!this.featureDAO || !this.modelDAO) return;
      this.generateFeatureDAO(this.data);
    },

    addChild: function(child) {
      this.SUPER(child);
      // add diagram node of the child to ours (child is a PropertyView in our case)
      // TODO(jacksonic): make a digram specific PropertyView trait to pass through diagramItem
      if ( this.diagramItem && child.view && child.view.diagramItem ) this.diagramItem.addChild(child.view.diagramItem);
    },
    removeChild: function(child) {
      if ( this.diagramItem && child.view && child.view.diagramItem ) this.diagramItem.removeChild(child.view.diagramItem);
      this.SUPER(child);
    }


  }
});

CLASS({
  name: 'FeatureListDiagram',
  package: 'foam.documentation',
  
  requires: ['foam.documentation.FeatureDiagram',
             'diagram.SectionGroup'],
  
  traits: [ 'foam.views.ChildTreeTrait',
            'foam.views.DataConsumerTrait',
            'foam.views.DataProviderTrait',
            'foam.documentation.DocDiagramTrait',
            'foam.documentation.FeatureListLoaderTrait'],

  documentation: function() {/*
    Renders a feature list (such as $$DOC{ref:'Model.properties'}, $$DOC{ref:'Model.methods'}, etc.) into
    a diagram.
  */},
  
  properties: [
    {
      name: 'diagramItem',
      factory: function() {
        return this.SectionGroup.create({ title: this.featureType.capitalize() });
      }
    }
  ],

  methods: {
    construct: function() {
      this.SUPER();
      this.diagramItem.title = this.featureType.capitalize();
      console.log("constructing FeatureListDiagram, already have children: ", this.children, this.diagramItem.children);
      this.selfFeaturesDAO.limit(5).select({ put: function(item) {
        var X = this.childX.sub({ data$: this.childX.SimpleValue.create(item, this.childX) });
        this.addChild(this.FeatureDiagram.create({ model: item.model_ }, X));
      }.bind(this)});
    },
  
    addChild: function(child) {
      this.SUPER(child);
      // add diagram node of the child to ours
      if ( this.diagramItem && child.diagramItem ) this.diagramItem.addChild(child.diagramItem);
    },
    removeChild: function(child) {
      if ( this.diagramItem &&  child.diagramItem ) this.diagramItem.removeChild(child.diagramItem);
      this.SUPER(child);
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
    },
    {
      name: 'diagramItem',
      factory: function() {
        return this.Section.create({ title: ( this.data ? this.data.name : "" ), titleFont: '10px' });
      }
    }
  ],
});

 
 
 
