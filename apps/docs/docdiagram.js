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
      type: 'foam.graphics.diagram.DiagramItemTrait'
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
  extendsModel: 'foam.graphics.CViewView',
  package: 'foam.documentation',
  
  requires: ['foam.documentation.ModelDocDiagram',
             'foam.documentation.ExtendsDiagram',
             'foam.documentation.TraitListDiagram',
             'foam.graphics.diagram.LinearLayout',
             'foam.graphics.diagram.Margin',
             'foam.graphics.diagram.AutoSizeDiagramRoot',
             'foam.graphics.Spacer'],
  
  documentation: function() {/*
    A view that renders one model's diagram.
  */},

  properties: [
    {
      name: 'autoSizeLayout',
      type: 'foam.graphics.diagram.AutoSizeDiagramRoot',
      factory: function() {
        // Set the root to NOT paint until we have finished construct()
        return this.AutoSizeDiagramRoot.create({ suspended: true });
      }
    },
    {
      name: 'outerMargin',
      type: 'foam.graphics.diagram.Margin',
      factory: function() {
        return this.Margin.create({ top: 5, left: 5, bottom: 5, right: 5 });
      }
    },
    {
      name: 'outerLayout',
      type: 'foam.graphics.diagram.LinearLayout',
      factory: function() {
        return this.LinearLayout.create({orientation:'horizontal'});
      }
    },
    {
      name: 'extendsLayout',
      type: 'foam.graphics.diagram.LinearLayout',
      factory: function() {
        return this.LinearLayout.create({orientation:'vertical'});
      }
    },
    {
      name: 'mainLayout',
      type: 'foam.graphics.diagram.LinearLayout',
      factory: function() {
        return this.LinearLayout.create({orientation:'horizontal'});
      }
    },
    {
      name: 'extendsModelLayout',
      type: 'foam.graphics.diagram.LinearLayout',
      factory: function() {
        return this.LinearLayout.create({orientation:'vertical'});
      }
    },
    {
      name: 'traitDiagram',
      factory: function() {
        return this.TraitListDiagram.create({ data$: this.data$, sourceDiag: this.modelDiagram });
      }     
    },
    {
      name: 'modelDiagram',
      factory: function() {
        var modelDiagram = this.ModelDocDiagram.create({ data$: this.data$, titleColor: 'black' });
        return modelDiagram;
      }
    },
    {
      name: 'extendsDiagram',
      factory: function() {
        var extendsDiagram = this.ExtendsDiagram.create({ data$: this.data$, extended: this.modelDiagram });
        this.extendsModelLayout.addChild(extendsDiagram.diagramItem);
        return extendsDiagram;
      }
    },
  ],

  methods: {
    init: function() {
      this.SUPER();

      this.mainLayout.addChild(this.Spacer.create());
      this.mainLayout.addChild(this.modelDiagram.diagramItem);
      this.mainLayout.addChild(this.Spacer.create());
      
      this.cview = this.autoSizeLayout;
      this.autoSizeLayout.addChild(this.outerMargin);
      this.outerMargin.addChild(this.outerLayout);
      this.outerLayout.addChild(this.traitDiagram.diagramItem);
      this.outerLayout.addChild(this.extendsLayout);
      this.extendsLayout.addChild(this.extendsModelLayout);
      this.extendsLayout.addChild(this.mainLayout);
            
      Events.follow(this.modelDiagram.diagramItem.verticalConstraints.preferred$, this.traitDiagram.spacing$);
    },

    toHTML: function() {
      this.destroy();
      ret = this.SUPER();
      this.construct();
      return ret;
    },

    construct: function() {
      this.SUPER();
      // Crude delay to let the featureDAO children populate before painting.
      // TODO(jacksonic): implement a better way for children to notify of async operations
      X.setTimeout(function() { 
        this.autoSizeLayout.suspended = false;
        this.autoSizeLayout.paint();
//console.log("          root painting active"); 
      }.bind(this), 1000);  
    },
    
    destroy: function() {
      this.autoSizeLayout.suspended = true;
//console.log("root painting OFF"); 
      
    }
    
  }
});

CLASS({
  name: 'ExtendsDiagram',
  package: 'foam.documentation',

  extendsModel: 'foam.ui.DestructiveDataView',

  requires: ['foam.documentation.ModelDocDiagram',
             'foam.documentation.DocLinkDiagram',
             'foam.graphics.diagram.LinearLayout',
             'foam.graphics.diagram.Link',
             'foam.graphics.Spacer',
             'SimpleValue',
             'foam.documentation.DocRef'],

  documentation: function() {/*
    A view that renders one model's extendsModel, and recursively builds another ExtendsModel.
  */},

  properties: [
    {
      name: 'diagramItem',
      type: 'foam.graphics.diagram.LinearLayout',
      factory: function() {
        return this.LinearLayout.create({orientation:'vertical'});
      }
    },
    {
      name: 'mainLayout',
      type: 'foam.graphics.diagram.LinearLayout',
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
      var spacer = this.Spacer.create();
      spacer.verticalConstraints.min$ = this.spacing$;
      spacer.stretchFactor = 1;
      this.diagramItem.addChild(spacer);
    },

    shouldDestroy: function(old,nu) {
      return true;
    },
    
    construct: function() {
      this.SUPER();
      // don't just copy data, find extendsModel and send that to children
      var childData = FOAM.lookup(this.data.extendsModel, this.X);
            
      var childX = this.X.sub({ 
        documentViewRef: this.SimpleValue.create(
          this.DocRef.create({ ref: this.data.extendsModel })
      )});

      if (childData) {
        var thisDiag = this.ModelDocDiagram.create({ data: childData, model: childData }, childX);
        if ( childData.extendsModel ) {
          this.addChild(this.X.foam.documentation.ExtendsDiagram.create({ data: childData, extended: thisDiag }, childX));
        }

        this.addChild(thisDiag);

        // the arrow
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
  name: 'TraitListDiagram',
  package: 'foam.documentation',

  extendsModel: 'foam.ui.LeafDataView',

  requires: ['foam.documentation.ModelDocDiagram',
             'foam.documentation.DocLinkDiagram',
             'foam.graphics.diagram.LinearLayout',
             'foam.graphics.diagram.Link',
             'foam.graphics.Spacer',
             'SimpleValue',
             'foam.documentation.DocRef'],
            
  documentation: function() {/*
    A view that renders one model's traits.
  */},

  properties: [
    {
      name: 'data',
      adapt: function(old, nu) {
        if ( typeof nu == 'string' ) {
          return FOAM.lookup(nu, this.X);
        }
        return nu;
      }
    },
    {
      name: 'diagramItem',
      type: 'foam.graphics.diagram.LinearLayout',
      factory: function() {
        return this.LinearLayout.create({orientation:'vertical'});
      }
    },
    {
      name: 'mainLayout',
      type: 'foam.graphics.diagram.LinearLayout',
      factory: function() {
        return this.LinearLayout.create({orientation:'horizontal'});
      }
    },
    {
      name: 'sourceDiag',
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
      this.diagramItem.addChild(this.Spacer.create({stretchFactor: 1}));
      this.diagramItem.addChild(this.mainLayout);
      this.diagramItem.addChild(this.Spacer.create({fixedHeight$: this.spacing$}));
    },

    construct: function() {
      this.SUPER();
      var self = this;
      
      self.data.traits.forEach( function(trait) {
      
        var traitModel = FOAM.lookup(trait, self.X);
        
        var X = self.X.sub({ 
          documentViewRef: self.SimpleValue.create(self.DocRef.create({ ref: trait }, self.X))
        });
        var traitDiag = self.ModelDocDiagram.create({ model: Model, data: traitModel, titleColor: 'rgba(30,160,30,255)' }, X);
        self.addChild(traitDiag);
        self.addChild(self.DocLinkDiagram.create({ start: traitDiag, end$: self.sourceDiag$ }));
    
      });
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

  traits: [ 'foam.patterns.ChildTreeTrait',
            'foam.documentation.DocDiagramTrait'],

  requires: ['foam.graphics.diagram.Link'],

  properties: [
    {
      name: 'diagramItem',
      type: 'foam.graphics.diagram.LinearLayout',
      factory: function() {
        return this.Link.create({arrowStyle: 'generalization'});
      }
    },
    {
      name: 'start',
      type: 'foam.documentation.DocDiagramTrait',
      postSet: function() {
        if ( ! this.start ) return;
        
        if (this.start.linkableItem) 
          this.diagramItem.start = this.start.linkableItem.myLinkPoints;
        else if (this.start.diagramItem)
          this.diagramItem.start = this.start.diagramItem.myLinkPoints;
      }
    },
    {
      name: 'end',
      type: 'foam.documentation.DocDiagramTrait',
      postSet: function() {
        if ( ! this.end ) return;
        
        if (this.end.linkableItem) 
          this.diagramItem.end = this.end.linkableItem.myLinkPoints;
        else if (this.end.diagramItem)
          this.diagramItem.end = this.end.diagramItem.myLinkPoints;
      }
    }
  ]


});

CLASS({
  name: 'ModelDocDiagram',
  package: 'foam.documentation',
  extendsModel: 'foam.ui.DestructiveDataView',
  traits: ['foam.ui.TemplateSupportTrait',
           'foam.documentation.DocModelFeatureDAOTrait'],

  requires: ['foam.graphics.diagram.Block',
             'foam.graphics.diagram.Section',
             'foam.graphics.diagram.Margin',
             'foam.documentation.FeatureListDiagram'],

  documentation: function() {/*
    A diagram block documenting one $$DOC{ref:'Model'}.
  */},

  properties: [
    {
      name: 'data',
      postSet: function(old,nu) {
        if (this.data) {
          this.modelName = this.data.name;
          this.packageName = this.data.package;
        }
        this.processModelChange();
      }
    },
    {
      name: 'modelName',
      type: 'String'
    },
    {
      name: 'packageName',
      type: 'String'
    },
    {
      name: 'titleColor',
      defaultValue: 'rgba(64,64,255,255)'
    },
    {
      name: 'diagramItem',
      factory: function() {
        var diagramItem = this.Margin.create({ bottom: 5, right: 5, left: 5, top: 5 });
        return diagramItem;
      }
    },
    {
      name: 'linkableItem',
      factory: function() {
        var linkableItem = this.Block.create({ border: 'black' });
        //Events.follow(linkableItem.verticalConstraints.preferred$, linkableItem.verticalConstraints.max$);
        linkableItem.addChild(
          this.Section.create({
            title$: this.packageName$, titleFont: '8px Roboto',
            padding: 3,
            background$: this.titleColor$,
            border: 'rgba(0,0,0,0)',
            borderWidth: 0,
            color: 'white'
          })
        );
        linkableItem.addChild(
          this.Section.create({
            title$: this.modelName$, titleFont: 'bold 16px Roboto',
            background$: this.titleColor$,
            border: 'rgba(0,0,0,0)',
            borderWidth: 0,
            color: 'white'
          })
        );
        return linkableItem;
      }
    }
  ],

  methods: {

    init: function() {
      this.SUPER();
      this.diagramItem.addChild(this.linkableItem);
    },
    
    construct: function() {
      this.SUPER();
      this.createTemplateView('properties', { model_: 'foam.documentation.FeatureListDiagram',
            model: this.X.Property, featureType:'properties' });
    },

    processModelChange: function() {
      // abort if it's too early //TODO: (we import data and run its postSet before the rest is set up)
      if (!this.featureDAO || !this.modelDAO) return;
    },

    addChild: function(child) {
      this.SUPER(child);
      // add diagram node of the child to ours (child is a PropertyView in our case)
      // TODO(jacksonic): make a digram specific PropertyView trait to pass through linkableItem
      if ( this.linkableItem && child.view && child.view.diagramItem ) this.linkableItem.addChild(child.view.diagramItem);
    },
    removeChild: function(child) {
      if ( this.linkableItem && child.view && child.view.diagramItem ) this.linkableItem.removeChild(child.view.diagramItem);
      this.SUPER(child);
    }

  }
});

CLASS({
  name: 'FeatureListDiagram',
  package: 'foam.documentation',

  requires: ['foam.documentation.FeatureDiagram',
             'foam.graphics.diagram.SectionGroup',
             'SimpleValue'],

  extendsModel: 'foam.ui.LeafDataView',
  traits: [ 'foam.documentation.DocDiagramTrait',
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
                                       titleBorderWidth: 0 });
      }
    }
  ],

  methods: {
    construct: function() {
      this.SUPER();
      this.diagramItem.title = this.featureType.capitalize();
      this.selfFeaturesDAO.limit(5).select({ 
        put: function(item) {
          this.addChild(this.FeatureDiagram.create({ model: item.model_, data: item }));
//          console.log("    Adding child from featureDAO ");
        }.bind(this),
        eof: function() {
//          console.log("    Done featureDAO ");
        }
      });
    },

  }

});

CLASS({
  name: 'FeatureDiagram',
  package: 'foam.documentation',
  extendsModel: 'foam.ui.DataView',
  traits: [ 'foam.documentation.DocDiagramTrait'],

  requires: ['foam.graphics.diagram.Section'],

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
