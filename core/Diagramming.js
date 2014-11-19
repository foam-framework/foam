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




MODEL({
  name: 'DiagramItem',
  package: 'diagram',

  extendsModel: 'CView2',

  methods: {
    addChild: function(child) {/* Replaces child's context with ours */
      child.X = this.X.sub();
      this.SUPER(child);
    }
  }

});


MODEL({
  name: 'Diagram',
  package: 'diagram',

  extendsModel: 'DiagramItem',

  exports: ['linkPoints'],

  properties: [
    {
      name: 'linkPoints',
      type: 'DAOProperty',
      documentation: function () {/* The shared store of linkable points in the diagram. */},
      defaultValue: []
    }
  ],

});



MODEL({
  name: 'LinkPoint',
  package: 'diagram',
  extendsModel: 'canvas.Point',

  properties: [
    {
      name: 'side',
      type: 'String',
      defaultValue: 'right' // left, top, bottom, right
    },
    {
      name: 'name',
      type: 'String'
    },
    {
      name: 'owner',
      type: 'DiagramItem'
    }
  ]
  
});


MODEL({
  name: 'Block',
  package: 'diagram',
  
  extendsModel: 'canvas.LinearLayout',
  traits: ['canvas.BorderTrait'],
  
  properties: [
    {
      name: 'orientation',
      defaultValue: 'vertical'
    },
  ],
    
});

MODEL({
  name: 'Section',
  package: 'diagram',

  requires: ['canvas.Label as Label'],

  extendsModel: 'canvas.LinearLayout',
  traits: ['canvas.BorderTrait'],

  imports: ['linkPoints'],

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
      name: 'myLinkPoints',
      type: 'DAOProperty',
      dynamicValue: function() {
        // proxy until this shows up in the context?
        if (this.linkPoints) this.myLinkPoints = this.linkPoints.where(EQ(LinkPoint.OWNER, this));
      }
    }
  ],

  methods: {
    init: function() {
      this.SUPER();

      //Events.dynamic(function() { this.linkPoints; } , function() {

      this.addChild(this.Label.create({text$: this.title$, font$: this.titleFont$}));
      this.verticalConstraints.max.val$ = this.verticalConstraints.preferred.pix$;
    }
  }


});
