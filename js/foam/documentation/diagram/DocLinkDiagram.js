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
  name: 'DocLinkDiagram',

  traits: [ 'foam.patterns.ChildTreeTrait',
            'foam.documentation.diagram.DocDiagramTrait'],

  requires: ['foam.graphics.diagram.Link'],

  properties: [
    {
      name: 'diagramItem',
      // type: 'foam.graphics.diagram.LinearLayout',
      factory: function() {
        return this.Link.create({arrowStyle: 'generalization'});
      }
    },
    {
      name: 'start',
      // type: 'foam.documentation.diagram.DocDiagramTrait',
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
      // type: 'foam.documentation.diagram.DocDiagramTrait',
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

