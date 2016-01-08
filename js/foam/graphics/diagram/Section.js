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
  name: 'Section',
  extends: 'foam.graphics.diagram.LinearLayout',

  label: 'Section',

  requires: ['foam.graphics.Label as Label',
             'foam.graphics.diagram.LinkPoint'],

  traits: ['foam.graphics.BorderTrait'],

  properties: [
    {
      name: 'orientation',
      defaultValue: 'horizontal'
    },
    {
      name: 'title',
      type: 'String',
    },
    {
      name: 'titleFont',
      type: 'String',
      defaultValue: 'bold 14px Roboto'
    },
    {
      name: 'border',
      defaultValue: 'black'
    },
    {
      name: 'padding',
      defaultValue: 5
    },
    {
      name: 'myLinkPoints',
      type: 'foam.core.types.DAO',
      factory: function() { return []; }
    },
    {
      name: 'clipping',
      defaultValue: true
    },
    {
      name: 'stretchy',
      defaultValue: false
    }
  ],

  methods: {
    init: function() {
      this.SUPER();

      this.addChild(this.Label.create({
        text$: this.title$,
        font$: this.titleFont$,
        color$: this.color$,
        padding$: this.padding$
      }));
      this.verticalConstraints.max$ = this.verticalConstraints.preferred$Pix$;

      this.addLinkPoints();
    },
    // TODO: account for movement that changes our parent but not our x,y,width,height
    addLinkPoints: function() {
      var pt3 = this.LinkPoint.create({owner: this, name: 'sectionLeft', side:'left'});
      this.myLinkPoints.push(pt3);

      var pt4 = this.LinkPoint.create({owner: this, name: 'sectionRight', side:'right'});
      this.myLinkPoints.push(pt4);
    }
  }
});
