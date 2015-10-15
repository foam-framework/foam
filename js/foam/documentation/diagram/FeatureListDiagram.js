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
  name: 'FeatureListDiagram',
  package: 'foam.documentation.diagram',

  requires: ['foam.documentation.diagram.FeatureDiagram',
             'foam.graphics.diagram.SectionGroup',
             'SimpleValue'],

  extends: 'foam.ui.BaseView',
  traits: [ 'foam.documentation.diagram.DocDiagramTrait',
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
        }.bind(this)
      });
    },

  }

});

