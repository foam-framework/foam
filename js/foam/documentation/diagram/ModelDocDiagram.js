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
  name: 'ModelDocDiagram',
  package: 'foam.documentation.diagram',
  extendsModel: 'foam.ui.DestructiveDataView',
  traits: ['foam.ui.TemplateSupportTrait',
           'foam.documentation.DocModelFeatureDAOTrait'],

  requires: ['foam.graphics.diagram.Block',
             'foam.graphics.diagram.Section',
             'foam.graphics.diagram.Margin',
             'foam.documentation.diagram.FeatureListDiagram'],

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
        //this.processModelChange();
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
      this.createTemplateView('properties', { model_: 'foam.documentation.diagram.FeatureListDiagram',
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

