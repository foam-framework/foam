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

MODEL({
  name: 'ConstraintProperty',
  package: 'layout',

  documentation: function() {/* Stores an integer pixel value or percentage.
    For percentages, a layoutPixelSize is imported. Export this from your
    layout items from total layout width or height depending on orientation. */},

  properties: [
//    {
//      model_: 'BooleanProperty',
//      name: 'isPercentage',
//      defaultValue: false,
//      mode: 'read-only',
//      documentation: function() { /* Indicates if the value is a percentage
//          0-100. $$DOC{ref:'.val'} will be reduced to 100 if too large when
//          $$DOC{ref:'.isPercentage'} is set to true. */ }
//    },
    {
      name: 'val',
      postSet: function() { this.pix = undefined; },
      documentation: function() { /* The value in pixels or as a percentage.
        If a string including '%' is specified, percentage is assumed.
        If an integer is specfied, it is treated as a
        pixel value. */ }
    },
    {
      model_: 'IntProperty',
      name: 'pix',
      hidden: true,
      mode: 'read-only',
      getter: function() {
        if (!this.instance_.pix) {
          if (this.isPercentage()) {
            this.instance_.pix = (parseInt(this.val.replace('%','') || 0) / 100) * this.totalSize_;
          } else {
            this.instance_.pix = parseInt(this.val || 0)
          }
        }
        return this.instance_.pix;
      },
      documentation: function() { /* The calculated pixel value, based on $$DOC{ref:'.val'}. */ }

    },
    {
      model_: 'IntProperty',
      name: 'totalSize_',
      hidden: true,
      postSet: function() { this.pix = undefined; }
    }
  ],

  methods: {
    isPercentage: function() {
      return  (typeof this.val === 'string' && this.val.indexOf('%') !== -1);
    }
  }

});


MODEL({
  name: 'LayoutItemLinearConstraints',
  package: 'layout',

  documentation: function() {/* The information layout items provide for a
                            single axis of linear layout. */},

  properties: [
    {
      factory: function() { return this.X.layout.ConstraintProperty.create({val:100}); },
      name: 'preferred',
      documentation: function() {/* The preferred item size. */},
      view: 'DetailView'
    },
    {
      factory: function() { return this.X.layout.ConstraintProperty.create({val:0}); },
      name: 'min',
      documentation: function() {/* The minimum size. */},
      view: 'DetailView'
    },
    {
      factory: function() { return this.X.layout.ConstraintProperty.create({val:'100%'}); },
      name: 'max',
      documentation: function() {/* The maximum size. */},
      view: 'DetailView'
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
  ],

  methods: {
    setTotalSize: function(size) {
      this.preferred.totalSize_ = size;
      this.min.totalSize_ = size;
      this.max.totalSize_ = size;
    }
  }

});

MODEL({
  name: 'LayoutItemHorizontalTrait',
  package: 'layout',

  documentation: function() {/* This trait enables an item to be placed in
                                a horizontal layout. If you do not  */},

  properties: [
    {
      name: 'horizontalConstraints',
      type: 'LayoutItemLinearConstraints',
      documentation: function() {/* Horizontal layout constraints. If undefined,
                              no constraints or preferences are assumed. */},
      factory: function() {
        return this.X.layout.LayoutItemLinearConstraints.create();
      }
    }
  ]

});

MODEL({
  name: 'LayoutItemVerticalTrait',
  package: 'layout',

  documentation: function() {/* This trait enables an item to be placed in
                                a vertical layout. */},

    properties: [
    {
      name: 'verticalConstraints',
      type: 'LayoutItemLinearConstraints',
      documentation: function() {/* Vertical layout constraints. If undefined,
                              no constraints or preferences are assumed. */},
      factory: function() {
        return this.X.layout.LayoutItemLinearConstraints.create();
      }
    }
  ]

});

MODEL({
  name: 'LinearLayoutTrait',
  package: 'layout',

  documentation: function() {/*
      A linear layout for row or column alignment. Only the main axis is laid out.
      This layout assumes the trait owner has a <code>this.children</code> array, and the
      items inside implement $$DOC{ref:'layout.LayoutItemHorizontalTrait'} or
      $$DOC{ref:'layout.LayoutItemVerticalTrait'},
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
        return (constraints.min.pix && val < constraints.min.pix)? constraints.min.pix :
               (constraints.max.pix && val > constraints.max.pix)? constraints.max.pix :
               val;
      }

      var availableSpace = parentSizeF(this);
      var sz = parentSizeF(this);
      
      // initialize with all at preferred size
      var itemSizes = [];
      var i = 0;
      this.children.forEach(function(child) {
        constraintsF(child).setTotalSize(sz); // for percentages
        itemSizes[i] = boundedF(constraintsF(child).preferred.pix, constraintsF(child));
        availableSpace -= itemSizes[i];
        i++;
      });
      
      var resizeF = function(isShrink) {
        var sizeOkF, factorF, sizeNotOkF, makeSizeOkF;
        if (isShrink) {
          sizeOkF = function(index, child) {
            return itemSizes[index] > constraintsF(child).min.pix;
          }
          factorF = function(child) {
            return constraintsF(child).shrinkFactor;
          }
          sizeNotOkF = function(index, child) {
            return itemSizes[index] < constraintsF(child).min.pix;
          }
          makeSizeOkF = function(index, child) {
            availableSpace += itemSizes[index] - constraintsF(child).min.pix;
            itemSizes[index] = constraintsF(child).min.pix;
            resizeF(true); // recurse with a smaller list now that item i is locked at minimum
            // This will eventually catch the case where we can't shrink enough, since we
            // will keep re-shrinking until the list of workingSet is empty.
            return false;
          }
        } else { //grow
          sizeOkF = function(index, child) {
            return itemSizes[index] < constraintsF(child).max.pix;
          }
          factorF = function(child) {
            return constraintsF(child).stretchFactor;
          }
          sizeNotOkF = function(index, child) {
            return itemSizes[index] > constraintsF(child).max.pix;
          }
          makeSizeOkF = function(index, child) {
            availableSpace += itemSizes[index] - constraintsF(child).max.pix;
            itemSizes[index] = constraintsF(child).max.pix;
            resizeF(false); // recurse with a smaller list now that item i is locked at minimum
            // This will eventually catch the case where we can't shrink enough, since we
            // will keep re-shrinking until the list of workingSet is empty.
            return false;
          }
        }
        
        // find all workingSet
        var workingSet = []; // indexes into children[], since we reference itemSizes[] too
        var modifyTotal = 0;
        var i = 0;
        this.children.forEach(function(child) {
          if (sizeOkF(i, child) // item is willing and able to shrink
              && factorF(child) > 0) {
            workingSet.push(i);
            modifyTotal += factorF(child);
          }
          i++;
        });
        if (workingSet.length === 0) { // if no willing items, try the ones with factor 0
          i = 0;
          this.children.forEach(function(child) {
            if (sizeOkF(i, child)) { // item is able to shrink, though not willing
              workingSet.push(i);
              modifyTotal += 1; // since constraintsF(child).shrinkFactor === 0
            }
            i++;
          });
        }
        if (workingSet.length === 0) {
          // absolutely nothing we can shrink. Abort!
          if (isShrink)
            console.warn("Layout failed to shrink due to minimum sizing: ", this, itemSizes, parentSizeF(this));
          else
            console.warn("Layout failed to stretch due to maximum sizing: ", this, itemSizes, parentSizeF(this));
          applySizesF(); // size it anyway
          return;
        }
        // float division, so we have to keep a running total later 
        // and round only when setting pos and size
        var modifyEachBy = availableSpace / modifyTotal;
        
        // apply the shrinkage
        workingSet.every(function(i) {
          var factor = factorF(this.children[i]);
          if (factor < 1) factor = 1;
          itemSizes[i] += modifyEachBy * factor;
          availableSpace -= modifyEachBy * factor;
          if (sizeNotOkF(i, this.children[i])) { // if we hit the limit for this item
            return makeSizeOkF(i, this.children[i]);
          }
          return true;
        }.bind(this));
        
        // lock in changes, we're done
        applySizesF();
        
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
        resizeF(false);
      } else if (availableSpace < 0) {
        resizeF(true);
      } else {
        // we're done!
        applySizesF();
      }
      
      
    }
  }
});





















