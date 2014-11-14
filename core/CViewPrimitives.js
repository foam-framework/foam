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


//////////////////////////////// Layout stuff
// Note that this should be merged into layout.js when ready

MODEL({
  name: 'LayoutItemLinearConstraints',
  package: 'canvas',

  extendsModel: 'Property',

  documentation: function() {/* The information layout items provide for a
                            single axis of linear layout. */},

  properties: [
    {
      model_: 'IntProperty',
      name: 'preferred',
      documentation: function() {/* The preferred item size. If undefined, no preference. */},
    },
    {
      model_: 'IntProperty',
      name: 'min',
      documentation: function() {/* The minimum size. If undefined, no preference. */},
    },
    {
      model_: 'IntProperty',
      name: 'max',
      documentation: function() {/* The maximum size. If undefined, no preference. */},
    },
    {
      model_: 'IntProperty',
      name: 'stretchFactor',
      defaultValue: 0,
      documentation: function() {/* If zero, item will not grow unless all other
            items are ungrowable. If above zero,
            indicates the proportion of space this item should take (versus the
            total of all stretch factors in the layout). */},
    },
    {
      model_: 'IntProperty',
      name: 'shrinkFactor',
      defaultValue: 0,
      documentation: function() {/* If zero, item will not shrink unless all other
            items are unshrinkable. If above zero,
            indicates the proportion of space this item should take (versus the
            total of all shrink factors in the layout). */},
    }

  ]

});

MODEL({
  name: 'LayoutItemHorizontalTrait',
  package: 'canvas',

  documentation: function() {/* This trait enables an item to be placed in
                                a horizontal layout. If you do not  */},
  properties: [
    {
      model_: 'LayoutItemLinearConstraints',
      name: 'horizontalConstraints',
      documentation: function() {/* Horizontal layout constraints. If undefined,
                              no constraints or preferences are assumed. */},
    }
  ]

});

MODEL({
  name: 'LayoutItemVerticalTrait',
  package: 'canvas',

  documentation: function() {/* This trait enables an item to be placed in
                                a vertical layout. */},
  properties: [
    {
      model_: 'LayoutItemLinearConstraints',
      name: 'verticalConstraints',
      documentation: function() {/* Vertical layout constraints. If undefined,
                              no constraints or preferences are assumed. */},
    }
  ]

});


MODEL({
  name: 'Layout',
  package: 'canvas',

  extendsModel: 'CView2',

  documentation: function() {/*
      Base model for layouts that control the position and size of
      child $$DOC{ref:'CView2'} instances. $$DOC{ref:'.',usePlural:true}
      themselves to not paint anything, except as a debug tool.
    */},

  listeners: [
    {
      name: 'performLayout',
      isFramed: true,
      documentation: function() {/* Performs a full layout of child items. */},
      code: function(evt) {
        this.calculateLayout();
      }
    }
  ],
  methods: {
    calculateLayout: function() { /* Override to perform your layout operation */
      console.warn("No layout operation defined in " + this.name +
                   ". Did you forget to define listener performLayout()?");
    }
  }
});

MODEL({
  name: 'LinearLayout',
  package: 'canvas',

  extendsModel: 'CView2',

  documentation: function() {/*
      A linear layout for row or column alignment. Only the main axis is laid out.
    */},

  properties: [
    {
      name: 'orientation',
      type: 'String', // TODO: should be ENUM
      defaultValue: 'horizontal',
      documentation: function() {/* Set to 'horizontal' or 'vertical'. */},
    }
  ],

  methods: {
    calculateLayout: function() { /* lay out items along the primary axis */

    }
  }
});







MODEL({
  name:  'Rectangle',

  extendsModel: 'CView2',

  package: 'canvas',

  properties: [
    {
      name:  'border',
      label: 'Border Color',
      type:  'String',
      defaultValue: undefined
    },
    {
      name:  'borderWidth',
      type:  'int',
      defaultValue: 1
    },
    {
      name: 'background',
      defaultValue: 'rgba(0,0,0,0)'
    }
  ],

  methods: {

    paintSelf: function() {
      var c = this.canvas;
      c.save();

      c.globalAlpha = this.alpha;

      if ( this.color ) {
        c.fillStyle = this.color;

        c.beginPath();
        c.rect(this.x, this.y, this.width, this.height);
        c.closePath();
        c.fill();
      }

      if ( this.border ) {
        c.lineWidth = this.borderWidth;
        c.strokeStyle = this.border;
        c.beginPath();
        c.rect(this.x, this.y, this.width, this.height);
        c.closePath();
        c.stroke();
      }

      c.restore();
    }
  }
});

MODEL({
  name:  'Label',

  extendsModel: 'CView2',

  package: 'canvas',

  properties: [
    {
      name:  'textAlign',
      label: 'Text Alignment',
      type:  'String',
      defaultValue: 'left',
      help: "Text alignment can be left, right, center, or the locale aware start and end."
    },
    {
      name: 'text',
      aliases: 'data',
      type: 'String',
      defaultValue: ""
    },
    {
      name: 'font',
      type: 'String',
      defaultValue: "",
      help: "CSS-style font description string"
    },
    {
      name: 'background',
      defaultValue: 'rgba(0,0,0,0)'
    }

  ],

  methods: {

    paintSelf: function() {
      var c = this.canvas;
      c.save();
console.log("paint label", this.text);

      c.textBaseline = 'top';
      c.fillStyle = this.color;
      if (this.font) c.font = this.font;
      c.fillText(this.text, 0, 0, this.width);

      c.restore();
    }
  }
});




















