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
  name: 'FeatureDiagram',
  package: 'foam.documentation.diagram',
  extends: 'foam.ui.BaseView',
  traits: [ 'foam.documentation.diagram.DocDiagramTrait'],

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
