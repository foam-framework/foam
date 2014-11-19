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
  name: 'ConstraintValue',
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
      postSet: function() { this.pix = undefined; },
      documentation: function() { /* This is set by the layout implementation before
        performing a layout operation. */ }

    }
  ],

  methods: {
    isPercentage: function() { /* Indicates if the set $$DOC{ref:'.val'} is a percentage. */
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
      factory: function() { return this.X.layout.ConstraintValue.create({val:100}); },
      name: 'preferred',
      documentation: function() {/* The preferred item size. */},
      view: 'DetailView',
      type: 'layout.ConstraintValue'
    },
    {
      factory: function() { return this.X.layout.ConstraintValue.create({val:0}); },
      name: 'min',
      documentation: function() {/* The minimum size. */},
      view: 'DetailView',
      type: 'layout.ConstraintValue'
    },
    {
      factory: function() { return this.X.layout.ConstraintValue.create({val:'100%'}); },
      name: 'max',
      documentation: function() {/* The maximum size. */},
      view: 'DetailView',
      type: 'layout.ConstraintValue'
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
      if (this.preferred.totalSize_ !== size) {
        this.preferred.totalSize_ = size;
        this.min.totalSize_ = size;
        this.max.totalSize_ = size;
      }
    }
  }

});

MODEL({
  name: 'LayoutItemLinearConstraintsProxy',
  package: 'layout',

  extendsModel: 'layout.LayoutItemLinearConstraints',

  documentation: function() {/* The information layout items provide for a
                            single axis of linear layout. */},

  properties: [
    {
      name: 'data',
      type: 'layout.LayoutItemLinearConstraints',
      preSet: function(old,nu) {
        if (old) {
          Events.unfollow(old.preferred.pix$, this.preferred.val$);
          Events.unfollow(old.max.pix$, this.max.val$);
          Events.unfollow(old.min.pix$, this.min.val$);
          Events.unfollow(old.stretchFactor$, this.stretchFactor$);
          Events.unfollow(old.shrinkFactor$, this.shrinkFactor$);
        }
        return nu;
      },
      postSet: function() {
        Events.follow(this.data.preferred.pix$, this.preferred.val$);
        Events.follow(this.data.max.pix$, this.max.val$);
        Events.follow(this.data.min.pix$, this.min.val$);
        Events.follow(this.data.stretchFactor$, this.stretchFactor$);
        Events.follow(this.data.shrinkFactor$, this.shrinkFactor$);
      }
    }
  ],

  methods: {
    setTotalSize: function(size) {
      if (this.data) {
        this.data.setTotalSize(size);
      }
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
      type: 'layout.LayoutItemLinearConstraints',
      documentation: function() {/* Horizontal layout constraints. If undefined,
                              no constraints or preferences are assumed. */},
      factory: function() {
        return this.X.layout.LayoutItemLinearConstraints.create();
      },
      view:'DetailView'
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
      type: 'layout.LayoutItemLinearConstraints',
      documentation: function() {/* Vertical layout constraints. If undefined,
                              no constraints or preferences are assumed. */},
      factory: function() {
        return this.X.layout.LayoutItemLinearConstraints.create();
      },
      view:'DetailView'
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
    },
    {
      name: 'updatePreferredSize',
      isFramed: true,
      documentation: function() {/* Performs a full layout of child items. */},
      code: function(evt) {
        this.calculatePreferredSize();
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
        var applyOpposedPositionF = Function("item", "val", "item."+
                        (this.orientation==='vertical'? "x" : "y")+ " = val;");
        // For the off-axis, try and apply our height to the items, but bound it by their max/min
        var opposedConstraintsF = Function("item", "return item."+
                                           ((this.orientation === 'horizontal')? 'vertical':'horizontal')
                                           +"Constraints");
        var applyOpposedSizeF = Function("item", "val", "boundedF", "opposedConstraintsF",
                        "item."+ (this.orientation==='vertical'? "width" : "height") +
                        " = boundedF(val, opposedConstraintsF(item));");
        var opposedParentSize = this.orientation==='horizontal'? this.height : this.width;

        var i = 0;
        var pos = 0;
        this.children.forEach(function(child) {
          applySizeF(child, itemSizes[i]);
          applyOpposedSizeF(child, opposedParentSize, boundedF, opposedConstraintsF);

          applyPositionF(child, pos);
          applyOpposedPositionF(child, 0);

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
      
      
    },
    calculatePreferredSize: function() { /* Find the size of layout that accomodates all items
                                            at their preferred sizes. */
      var constraintsF = Function("item", "return item."+ this.orientation+"Constraints");
      var opposedConstraintsF = Function("item", "return item."+ 
                                         ((this.orientation === 'horizontal')? 'vertical':'horizontal')
                                         +"Constraints");
      var boundedF = function(val, constraints) { 
        return (constraints.min.pix && val < constraints.min.pix)? constraints.min.pix :
               (constraints.max.pix && val > constraints.max.pix)? constraints.max.pix :
               val;
      }
      var parentSizeF = Function("item", "return item."+ 
                      (this.orientation==='horizontal'? "width" : "height"));
      var sz = parentSizeF(this);      
      

      // sum up preferred sizes
      var totalSize = 0;
      var largestOpposedAxisPreferred = 0;
      this.children.forEach(function(child) {
        constraintsF(child).setTotalSize(sz); // for percentages
        totalSize += boundedF(constraintsF(child).preferred.pix, constraintsF(child));
        // also find the largest preferred size on our non-layout axis
        var oaPref = opposedConstraintsF(child)? opposedConstraintsF(child).preferred.pix : 0;
        if (oaPref > largestOpposedAxisPreferred) largestOpposedAxisPreferred = oaPref;
      });
      
      // apply if valid for our layout item traits
      if (constraintsF(this)) constraintsF(this).preferred.val = totalSize;
      if (opposedConstraintsF(this)) opposedConstraintsF(this).preferred.val = largestOpposedAxisPreferred;
    }
  }
});



MODEL({
  name:  'MarginTrait',
  package: 'layout',

  documentation: function() {/*
      Adds a margin around one child item. Requires $$DOC{ref:'addChild'} and
      $$DOC{ref:'removeChild'} methods on trait users. Use
      $$DOC{ref:'layout.LayoutItemHorizontalTrait'} and
      $$DOC{ref:'layout.LayoutItemVerticalTrait'} alongside this trait.
    */},

  models: [
    {
      model_: 'Model',
      name: 'MarginProxy',
      extendsModel: 'layout.LayoutItemLinearConstraintsProxy',

      documentation: function() {/* Adds an $$DOC{ref:'canvas.Margin.MarginProxy.addAmount'} to the proxied constraints. */},

      properties: [
        {
          name: 'data',
          documentation: function() {/* Overridden to introduce $$DOC{ref:'.addAmount'}. */},
          postSet: function() {
            var mapFn = function(val) { return val + this.addAmount }.bind(this);

            Events.map(this.data.preferred.pix$, this.preferred.val$, mapFn);
            Events.map(this.data.max.pix$, this.max.val$, mapFn);
            Events.map(this.data.min.pix$, this.min.val$, mapFn);

            Events.follow(this.data.stretchFactor$, this.stretchFactor$);
            Events.follow(this.data.shrinkFactor$, this.shrinkFactor$);
          }
        },
        {
          model_: 'IntProperty',
          name: 'addAmount',
          documentation: function() {/* The amount to add to the proxied pixel values. */},
          defaultValue: 0
        }
      ]
    }
  ],

  properties: [
    {
      model_: 'IntProperty',
      name:  'top',
      label: 'Top Margin',
      documentation: function() {/* Margin in pixels. */},
      defaultValue: 0
    },
    {
      model_: 'IntProperty',
      name:  'left',
      label: 'Left Margin',
      documentation: function() {/* Margin in pixels. */},
      defaultValue: 0
    },
    {
      model_: 'IntProperty',
      name:  'right',
      label: 'Right Margin',
      documentation: function() {/* Margin in pixels. */},
      defaultValue: 0
    },
    {
      model_: 'IntProperty',
      name:  'bottom',
      label: 'Bottom Margin',
      documentation: function() {/* Margin in pixels. */},
      defaultValue: 0
    },
    {
      name: 'horizontalConstraints',
      documentation: function() {/* Horizontal layout constraints. Proxied from
          the child. */},
      factory: function() { /* override with our special proxy */
        return this.X.canvas.Margin.MarginProxy.create();
      }
    },
    {
      name: 'verticalConstraints',
      documentation: function() {/* Vertical layout constraints. Proxied from
          the child. */},
      factory: function() { /* override with our special proxy */
        return this.X.canvas.Margin.MarginProxy.create();
      }
    }
  ],
  methods: {
    init: function() {
      this.SUPER();

      Events.dynamic(
            function(){ this.top; this.left; this.right; this.bottom;
                        this.width; this.height; }.bind(this),
            this.updateMargins);
    },

    addChild: function(child) { /* Adds a child $$DOC{ref:'CView2'} to the scene
                                   under this. Add our listener for child constraint
                                   changes. Only one child at a time is supported. */
      // remove any existing children so we only have at most one at all times
      this.children.forEach(this.removeChild.bind(this));

      this.SUPER(child);

      // proxy the child's constraints into ours
      if (child.verticalConstraints && this.verticalConstraints)
        this.verticalConstraints.data = child.verticalConstraints;
      if (child.horizontalConstraints && this.horizontalConstraints)
        this.horizontalConstraints.data = child.horizontalConstraints;
    },
    removeChild: function(child) { /* Removes the child $$DOC{ref:'CView2'} from the scene. */
      // unlisten
      if (this.verticalConstraints) this.verticalConstraints.data = undefined;
      if (this.horizontalConstraints) this.horizontalConstraints.data = undefined;

      this.SUPER(child);
    }
  },

  listeners: [
    {
      name: 'updateMargins',
      isFramed: true,
      documentation: function() {/* Adjusts child item. */},
      code: function(evt) {
        if (this.verticalConstraints) this.verticalConstraints.addAmount = this.top+this.bottom;
        if (this.horizontalConstraints) this.horizontalConstraints.addAmount = this.left+this.right;

        var child = this.children[0];
        if (child) {
          child.x = this.left;
          child.y = this.top;
          child.width = this.width - (this.left + this.right);
          child.height = this.height - (this.bottom + this.top);
        }
      }
    },
  ]
});


















