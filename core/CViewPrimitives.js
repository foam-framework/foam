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
      name: 'horizontalConstraints',
      type: 'LayoutItemLinearConstraints',
      documentation: function() {/* Horizontal layout constraints. If undefined,
                              no constraints or preferences are assumed. */},
      factory: function() {
        return this.X.canvas.LayoutItemLinearConstraints.create();
      }
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
      name: 'verticalConstraints',
      type: 'LayoutItemLinearConstraints',
      documentation: function() {/* Vertical layout constraints. If undefined,
                              no constraints or preferences are assumed. */},
      factory: function() {
        return this.X.canvas.LayoutItemLinearConstraints.create();
      }
    }
  ]

});


// MODEL({
//   name: 'LayoutTrait',
//   package: 'canvas',
//
//   documentation: function() {/*
//       Base model for layouts that control the position and size of
//       child $$DOC{ref:'CView2'} instances. $$DOC{ref:'.',usePlural:true}
//       themselves to not paint anything, except as a debug tool.
//     */},
//
//   listeners: [
//     {
//       name: 'performLayout',
//       isFramed: true,
//       documentation: function() {/* Performs a full layout of child items. */},
//       code: function(evt) {
//         this.calculateLayout();
//       }
//     }
//   ],
//   methods: {
//     calculateLayout: function() { /* Override to perform your layout operation */
//       console.warn("No layout operation defined in " + this.name +
//                    ". Did you forget to define listener performLayout()?");
//     }
//   }
// });

MODEL({
  name: 'LinearLayoutTrait',
  package: 'canvas',

  //extendsModel: 'canvas.LayoutTrait',

  documentation: function() {/*
      A linear layout for row or column alignment. Only the main axis is laid out.
      This layout assumes the trait owner has a <code>this.children</code> array, and the
      items inside implement $$DOC{ref:'LayoutItemHorizontalTrait'} or 
      $$DOC{ref:'LayoutItemVerticalTrait'},
      depending on $$DOC{ref:'.orientation'}.
    */},

  properties: [
    {
      name: 'orientation',
      type: 'String', // TODO: should be ENUM
      defaultValue: 'horizontal',
      documentation: function() {/* Set to 'horizontal' or 'vertical'. */},
    }
  ],
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
    calculateLayout: function() { /* lay out items along the primary axis */
      // these helpers take care of orientation awareness
      var constraintsF = Function("item", "return item."+ this.orientation+"Constraints");
      var sizeF = Function("item", "return item."+ 
                      (this.orientation==='horizontal'? "width" : "height"));
      var parentSizeF = Function("item", "return item."+ 
                      (this.orientation==='horizontal'? "width" : "height"));
            
      var boundedF = function(val, constraints) { 
        return (constraints.min && val < constraints.min)? constraints.min :
               (constraints.max && val > constraints.max)? constraints.max :
               val;
      }

      var availableSpace = parentSizeF(this);
      
      // initialize with all at preferred size
      var itemSizes = [];
      var i = 0;
      this.children.forEach(function(child) {
        itemSizes[i] = boundedF(constraintsF(child).preferred, constraintsF(child));
        availableSpace -= itemSizes[i];
        i++;
      });
      
      var shrinkF = function() {
        // find all shrinkables
        var shrinkables = []; // indexes into children[], since we reference itemSizes[] too
        var shrinkTotal = 0;
        var i = 0;
        this.children.forEach(function(child) {
          if (itemSizes[i] > constraintsF(child).min // item is willing and able to shrink
              && constraintsF(child).shrinkFactor > 0) {
            shrinkables.push(i);
            shrinkTotal += constraintsF(child).shrinkFactor;
          }
          i++;
        });
        if (shrinkables.length === 0) { // if no willing items, try the ones with factor 0
          i = 0;
          this.children.forEach(function(child) {
            if (itemSizes[i] > constraintsF(child).min) { // item is willing and able to shrink
              shrinkables.push(i);
              shrinkTotal += 1; // since constraintsF(child).shrinkFactor === 0
            }
            i++;
          });
        }
        if (shrinkables.length === 0) {
          // absolutely nothing we can shrink. Abort!
          console.warn("Layout failed to shrink due to minimum sizing: ", this, itemSizes);
          applySizesF(); // size it anyway
          return;
        }
        
        // float division, so we have to keep a running total later 
        // and round only when setting pos and size
        var shrinkEachBy = availableSpace / shrinkTotal;
        
        // apply the shrinkage
        shrinkables.every(function(i) {
          var constraints = constraintsF(this.children[i]);
          itemSizes[i] += shrinkEachBy * constraints.shrinkFactor;
          availableSpace -= shrinkEachBy * constraints.shrinkFactor;
          if (itemSizes[i] < constraints.min) { // if we hit the limit for this item
            availableSpace += itemSizes[i] - constraints.min;
            itemSizes[i] = constraints.min;
            shrinkF(); // recurse with a smaller list now that item i is locked at minimum
            // This will eventually catch the case where we can't shrink enough, since we
            // will keep re-shrinking until the list of shrinkables is empty.
            return false;
          }
        }.bind(this));
        
        // lock in changes, we're done
        applySizesF();
        
      }.bind(this);
      
      var growF = function() {
        
      }.bind(this);
      
      var applySizesF = function() {
        var applySizeF = Function("item", "val", "item."+ 
                        (this.orientation==='horizontal'? "width" : "height") + " = val;");
        var applyPositionF = Function("item", "val", "item."+ 
                        (this.orientation==='horizontal'? "x" : "y")+ " = val;");

        var i = 0;
        var pos = 0;
        this.children.forEach(function(child) {
          applySizeF(child, itemSizes[i]);
          applyPositionF(child, pos);
          pos += itemSizes[i];
          i++;
        });
      }.bind(this);
      
      if (availableSpace > 0) {
        growF();
      } else if (availableSpace < 0) {
        shrinkF();
      } else {
        // we're done!
        applySizesF();
      }
      
      
    }
  }
});

MODEL({
  name: 'LinearLayout',
  extendsModel: 'CView2',
  package: 'canvas',
  traits: [ 'canvas.LinearLayoutTrait']
  
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
        c.rect(0, 0, this.width, this.height);
        c.closePath();
        c.fill();
      }

      if ( this.border ) {
        c.lineWidth = this.borderWidth;
        c.strokeStyle = this.border;
        c.beginPath();
        c.rect(0, 0, this.width, this.height);
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




















