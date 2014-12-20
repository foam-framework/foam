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
  name: 'DocDiagramView',
  extendsModel: 'CViewView',
  package: 'foam.documentation',
  
  traits: [ 'foam.views.ChildTreeTrait',
            'foam.views.DataConsumerTrait'],
  
  requires: ['foam.documentation.ModelDocDiagram',
             'foam.documentation.ExtendsDiagram',
             'diagram.LinearLayout',
             'diagram.Margin',
             'diagram.LockToPreferredLayout',
             'foam.graphics.Spacer'],
  
  documentation: function() {/*
    A view that renders one model's diagram.
  */},
  
  properties: [
    {
      name: 'autoSizeLayout',
      type: 'diagram.LockToPreferredLayout',
      factory: function() {
        return this.LockToPreferredLayout.create();
      }
    },
    {
      name: 'outerMargin',
      type: 'diagram.Margin',
      factory: function() {
        return this.Margin.create({ top: 5, left: 5, bottom: 5, right: 5 });
      }
    },
    {
      name: 'outerLayout',
      type: 'diagram.LinearLayout',
      factory: function() {
        return this.LinearLayout.create({orientation:'vertical'});
      }
    },
    {
      name: 'mainLayout',
      type: 'diagram.LinearLayout',
      factory: function() {
        return this.LinearLayout.create({orientation:'horizontal'});
      }
    },
    {
      name: 'extendsModelLayout',
      type: 'diagram.LinearLayout',
      factory: function() {
        return this.LinearLayout.create({orientation:'vertical'});
      }
    },
    {
      name: 'modelDiagram',
      factory: function() {
        var modelDiagram = this.ModelDocDiagram.create();
        this.mainLayout.addChild(this.Spacer.create());
        this.mainLayout.addChild(modelDiagram.diagramItem);
        this.mainLayout.addChild(this.Spacer.create());
        return modelDiagram;
      }
    },
    {
      name: 'extendsDiagram',
      factory: function() {
        var extendsDiagram = this.ExtendsDiagram.create({ extended: this.modelDiagram });
        this.extendsModelLayout.addChild(extendsDiagram.diagramItem);
        return extendsDiagram;
      }
    }
  ],
  
  methods: {
    init: function() {
      this.SUPER();
      this.cview = this.autoSizeLayout;
      this.autoSizeLayout.addChild(this.outerMargin);
      this.outerMargin.addChild(this.outerLayout);
      this.outerLayout.addChild(this.extendsModelLayout);
      this.outerLayout.addChild(this.mainLayout);
      
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
  name: 'ExtendsDiagram',
  package: 'foam.documentation',

  traits: [ 'foam.views.ChildTreeTrait',
            'foam.views.DataConsumerTrait',
            'foam.views.DataProviderTrait'],

  requires: ['foam.documentation.ModelDocDiagram',
             'foam.documentation.DocLinkDiagram',
             'diagram.LinearLayout',
             'diagram.Link',
             'foam.graphics.Spacer',  
             'SimpleValue',
             'foam.documentation.DocRef'],

  documentation: function() {/*
    A view that renders one model's extendsModel, and recursively builds another ExtendsModel.
  */},

  properties: [
    {
      name: 'data',
      postSet: function() {
        this.destroy();
        this.childData = FOAM.lookup(this.data.extendsModel, this.X);
        this.construct();
      }
    },
    {
      name: 'diagramItem',
      type: 'diagram.LinearLayout',
      factory: function() {
        return this.LinearLayout.create({orientation:'vertical'});
      }
    },
    {
      name: 'mainLayout',
      type: 'diagram.LinearLayout',
      factory: function() {
        return this.LinearLayout.create({orientation:'vertical'});
      }
    },
    {
      name: 'extended',
      documentation: "The other doc diagram item to point the arrow from."
    },
    {
      name: 'spacing',
      model_: 'IntProperty',
      defaultValue: 45
    }
  ],

  methods: {
    init: function() {
      this.SUPER();
      
      this.mainLayout.verticalConstraints.preferred = 0;
      this.diagramItem.addChild(this.mainLayout);
      this.diagramItem.addChild(this.Spacer.create({fixedHeight$: this.spacing$}));
    },
    
    construct: function() {
      this.SUPER();

      this.childX.set('documentViewRef', this.SimpleValue.create(
        this.DocRef.create({ ref: this.data.extendsModel })
      ));

      if (this.childData) {
        var thisDiag = this.ModelDocDiagram.create({ model: this.childData }, this.childX);
        if (this.childData.extendsModel ) {
          this.addChild(this.X.foam.documentation.ExtendsDiagram.create({ extended: thisDiag }, this.childX));
        }

        this.addChild(thisDiag);
        
        // the arrow
                // almost working, check extended
        this.addChild(this.DocLinkDiagram.create({ start: thisDiag, end$: this.extended$ }));
      }
    },
    
    addChild: function(child) {
      this.SUPER(child);
      // add diagram node of the child to ours
      if ( this.mainLayout && child.diagramItem ) this.mainLayout.addChild(child.diagramItem);
    },
    removeChild: function(child) {
      if ( this.mainLayout &&  child.diagramItem ) this.mainLayout.removeChild(child.diagramItem);
      this.SUPER(child);
    }
  }
});

CLASS({
  name: 'DocLinkDiagram',
  package: 'foam.documentation',

  traits: [ 'foam.views.ChildTreeTrait',
            'foam.documentation.DocDiagramTrait'],
  
  requires: ['diagram.Link'],
  
  properties: [
    {
      name: 'diagramItem',
      type: 'diagram.LinearLayout',
      factory: function() {
        return this.Link.create({arrowStyle: 'generalization'});
      }
    },
    {
      name: 'start',
      type: 'foam.documentation.DocDiagramTrait',
      postSet: function() {
        if (this.start && this.start.diagramItem) this.diagramItem.start = this.start.diagramItem.myLinkPoints;
      }
    },
    {
      name: 'end',
      type: 'foam.documentation.DocDiagramTrait',
      postSet: function() {
        if (this.end && this.end.diagramItem) this.diagramItem.end = this.end.diagramItem.myLinkPoints;
      }
    }  
  ]
  
  
});

CLASS({
  name: 'ModelDocDiagram',
  extendsModel: 'foam.views.BaseDetailView',
  package: 'foam.documentation',
  traits: ['foam.documentation.DocModelFeatureDAOTrait'], 
    
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
        var diagramItem = this.Block.create({ border: 'black' }, this.childX);
        diagramItem.addChild(
          this.Section.create({
            title$: this.modelName$, titleFont: 'bold 16px Roboto',
            background: 'rgba(64,64,255,255)',
            color: 'white'
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
        return this.SectionGroup.create({ title: this.featureType.capitalize(), titleBackground: 'rgba(200,200,200,255)',
                                       titleBorderWidth: 2 });
      }
    }
  ],

  methods: {
    construct: function() {
      this.SUPER();
      this.diagramItem.title = this.featureType.capitalize();
      this.selfFeaturesDAO.limit(5).select({ put: function(item) {
        var X = this.childX.sub({ data$: this.childX.SimpleValue.create(item, this.childX) });
        this.addChild(this.FeatureDiagram.create({ model: item.model_ }, X));
      }.bind(this)});
    },
  
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
        return this.Section.create({ title: ( this.data ? this.data.name : "" ), titleFont: '10px',
                                     border: 'rgba(0,0,0,0)' });
      }
    }
  ],
});

 
 
 
