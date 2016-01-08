/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
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
  package: 'foam.graphics.diagram',
  name: 'Block',
  extends: 'foam.graphics.diagram.LinearLayout',
  
  requires: ['foam.graphics.diagram.LinkPoint'],

  traits: ['foam.graphics.BorderTrait'],

  documentation: function() {/*
    Represents one rectangular item. Typically used for a class or model representation.
    $$DOC{ref:'foam.graphics.diagram.Block',usePlural:true} include link points in the middle of each
    edge, and will block other links from routing through them.
  */},
    
  properties: [
    {
      name: 'orientation',
      defaultValue: 'vertical'
    },
    {
      name: 'myLinkPoints',
      type: 'foam.core.types.DAO',
      factory: function() { return []; }
    },
    {
      name: 'alpha',
      defaultValue: 0
    },
    {
      name: 'isLinkBlocking',
      defaultValue: true
    },
    {
      name: 'width',
      install: Movement.createAnimatedPropertyInstallFn(200, Movement.easeOut(1))
    },
    {
      name: 'stretchy',
      defaultValue: false
    },
    {
      name: 'dropShadow',
      defaultValue: 10
    },
  ],

  methods: {
    init: function() {
      this.SUPER();

      this.addLinkPoints();
      
      this.alpha = 1;
    },
    addLinkPoints: function() {
      {
        // make four points at our edges
        var pt1 = this.LinkPoint.create({owner: this, name: 'blockTop', side: 'top'});
        this.myLinkPoints.push(pt1);
      }
      {
        var pt2 = this.LinkPoint.create({owner: this, name: 'blockBottom', side: 'bottom'});
        this.myLinkPoints.push(pt2);
      }
      {
        var pt3 = this.LinkPoint.create({owner: this, name: 'blockLeft', side: 'left'});
        this.myLinkPoints.push(pt3);
      }
      {
        var pt4 = this.LinkPoint.create({owner: this, name: 'blockRight', side: 'right'});
        this.myLinkPoints.push(pt4);
      }
    }
  }
});
