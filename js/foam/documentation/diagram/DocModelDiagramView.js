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
  package: 'foam.documentation.diagram',
  name: 'DocModelDiagramView',
  extends: 'foam.documentation.diagram.DocDiagramView',

  documentation: function() {/*
    A view that renders one model's diagram, without base models or traits.
  */},

  properties: [
    {
      name: 'autoSizeLayout',
      // type: 'foam.graphics.diagram.AutoSizeDiagramRoot',
      factory: function() {
        // Set the root to NOT paint until we have finished construct()
        return this.AutoSizeDiagramRoot.create({ suspended: true });
      }
    },
    {
      name: 'outerMargin',
      // type: 'foam.graphics.diagram.Margin',
      factory: function() {
        return this.Margin.create({ top: 5, left: 5, bottom: 5, right: 5 });
      }
    },
    {
      name: 'outerLayout',
      // type: 'foam.graphics.diagram.LinearLayout',
      factory: function() {
        return this.LinearLayout.create({orientation:'horizontal'});
      }
    },
    {
      name: 'extendsLayout',
      // type: 'foam.graphics.diagram.LinearLayout',
      factory: function() {
        return this.LinearLayout.create({orientation:'vertical'});
      }
    },
    {
      name: 'mainLayout',
      // type: 'foam.graphics.diagram.LinearLayout',
      factory: function() {
        return this.LinearLayout.create({orientation:'horizontal'});
      }
    },
    {
      name: 'extendsModelLayout',
      // type: 'foam.graphics.diagram.LinearLayout',
      factory: function() {
        return this.LinearLayout.create({orientation:'vertical'});
      }
    },
    {
      name: 'traitDiagram',
      factory: function() {
        return null;
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
        return null;
      }
    },
  ],

  methods: {
    setupLayouts: function() {
      this.mainLayout.addChild(this.modelDiagram.diagramItem);

      this.cview = this.autoSizeLayout;
      this.autoSizeLayout.addChild(this.outerMargin);
      this.outerMargin.addChild(this.mainLayout);

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
      this.X.setTimeout(function() {
        this.autoSizeLayout.suspended = false;
        this.autoSizeLayout.paint();
      }.bind(this), 300);
    },

    destroy: function( isParentDestroyed ) {
      this.SUPER(isParentDestroyed);
      this.autoSizeLayout.suspended = true;

    }

  }
});


