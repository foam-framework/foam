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
  package: 'foam.patterns.layout',
  name: 'LinearLayoutTrait',

  documentation: function() {/*
      A linear layout for row or column alignment. Only the main axis is laid out.
      This layout assumes the trait owner has a <code>this.children</code> array, and the
      items inside implement $$DOC{ref:'foam.patterns.layout.LayoutItemHorizontalTrait'} or
      $$DOC{ref:'foam.patterns.layout.LayoutItemVerticalTrait'},
      depending on $$DOC{ref:'.orientation'}.
    */},

  properties: [
    {
      name: 'orientation',
      type: 'String', // TODO: should be ENUM
      defaultValue: 'horizontal',
      documentation: function() {/* Set to 'horizontal' or 'vertical'. */},
      postSet: function()  {
        this.layoutDirty = true; //this.calculateLayout();
      }
    },
    {
      type: 'Boolean',
      name: 'fitContents',
      defaultValue: false,
      documentation: function() {/* If set to true, the layout will set
          its own min and max constraints by the sum of the content. */},
      postSet: function() { this.calculatePreferredSize(); }
    },
    {
      type: 'Boolean',
      name: 'stretchy',
      defaultValue: true,

      documentation: function() {/* If true, the layout will set its stretch
        and shrink factors to the largest value of its children. If you don't
        want a stretchy child to cause your layout to become stretchy, set to
        false.
      */},
    },
    {
      type: 'Boolean',
      name: 'layoutDirty',
      defaultValue: true,
      hidden: true
    }
  ],
  listeners: [
    {
      name: 'performLayout',
      //isMerged: 1000,
      documentation: function() {/* Performs a full layout of child items. */},
      code: function(evt) {
//console.log("performLayout", this.$UID);
        // a child has triggered this change, do we probably have to lay out
        this.layoutDirty = true;
        // this change to our pref size may cause a parent to lay us out through a size change
        this.calculatePreferredSize();
        // If no parent caused us to change size and layout, force the layout operation
        //if ( this.layoutDirty ) this.calculateLayout();
      }
    },
  ],

  methods: {

    calculateLayout: function() { /* lay out items along the primary axis */
      // We are doing a layout operation, so we'll be clean now
      this.layoutDirty = false;

      // no children, nothing to do
      if (this.children.length <= 0) return;

      // size changes to ourself may impact percentage preferred size of some children,
      // so calculate it too. This calculateLayout operation doesn't depend on
      // anything that calculatePreferredSize() does.
      //this.calculatePreferredSize();

      // these helpers take care of orientation awareness
      var constraintsF = Function("item", "return item."+ this.orientation+"Constraints");
      var sizeF = Function("item", "return item."+
                      (this.orientation==='horizontal'? "width" : "height"));
      var parentSizeF = Function("item", "return item."+
                      (this.orientation==='horizontal'? "width" : "height"));

      var boundedF = function(val, constraints) {
        return (constraints.min$Pix && val < constraints.min$Pix)? constraints.min$Pix :
               (constraints.max$Pix && val > constraints.max$Pix)? constraints.max$Pix :
               val;
      }

      var availableSpace = parentSizeF(this);
      var sz = parentSizeF(this);

      // initialize with all at preferred size
      var itemSizes = [];
      var i = 0;
      this.children.forEach(function(child) {
        if ( constraintsF(child) ) {
          constraintsF(child).setTotalSize(sz); // for percentages
          itemSizes[i] = boundedF(constraintsF(child).preferred$Pix, constraintsF(child));
          availableSpace -= itemSizes[i];
        } else {
          itemSizes[i] = 0;
        }
        i++;
      });

      var resizeF = function(isShrink) {
        var sizeOkF, factorF, sizeNotOkF, makeSizeOkF;
        if (isShrink) {
          sizeOkF = function(index, child) {
            return itemSizes[index] > constraintsF(child).min$Pix;
          }
          factorF = function(child) {
            return constraintsF(child).shrinkFactor;
          }
          sizeNotOkF = function(index, child) {
            return itemSizes[index] < constraintsF(child).min$Pix;
          }
          makeSizeOkF = function(index, child) {
            availableSpace += itemSizes[index] - constraintsF(child).min$Pix;
            itemSizes[index] = constraintsF(child).min$Pix;
            resizeF(true); // recurse with a smaller list now that item i is locked at minimum
            // This will eventually catch the case where we can't shrink enough, since we
            // will keep re-shrinking until the list of workingSet is empty.
            return false;
          }
        } else { //grow
          sizeOkF = function(index, child) {
            return itemSizes[index] < constraintsF(child).max$Pix;
          }
          factorF = function(child) {
            return constraintsF(child).stretchFactor;
          }
          sizeNotOkF = function(index, child) {
            return itemSizes[index] > constraintsF(child).max$Pix;
          }
          makeSizeOkF = function(index, child) {
            availableSpace += itemSizes[index] - constraintsF(child).max$Pix;
            itemSizes[index] = constraintsF(child).max$Pix;
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
          if (constraintsF(child) && sizeOkF(i, child) // item is willing and able to shrink
              && factorF(child) > 0) {
            workingSet.push(i);
            modifyTotal += factorF(child);
          }
          i++;
        });
        if (workingSet.length === 0) { // if no willing items, try the ones with factor 0
          i = 0;
          this.children.forEach(function(child) {
            if (constraintsF(child) && sizeOkF(i, child)) { // item is able to shrink, though not willing
              workingSet.push(i);
              modifyTotal += 1; // since constraintsF(child).shrinkFactor === 0
            }
            i++;
          });
        }
        if (workingSet.length === 0) {
          // absolutely nothing we can shrink. Abort!
          // if (isShrink)
          //   console.warn("Layout failed to shrink due to minimum sizing: ", this, itemSizes, parentSizeF(this));
          // else
          //   console.warn("Layout failed to stretch due to maximum sizing: ", this, itemSizes, parentSizeF(this));
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
          if ( opposedConstraintsF(child) ) {
            // we didn't care about the off-axis before, so ensure it's set
            opposedConstraintsF(child).setTotalSize(opposedParentSize);

            applySizeF(child, itemSizes[i]);
            applyOpposedSizeF(child, opposedParentSize, boundedF, opposedConstraintsF);

            applyPositionF(child, pos);
            applyOpposedPositionF(child, 0);

            pos += itemSizes[i];
          }
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

      var self = this;
      var syncConstraints = this.fitContents ? ['min','max','preferred'] : ['preferred'];
      var stretchConstraints = this.stretchy ? ['stretchFactor', 'shrinkFactor'] : [];

      // no children, zero
      if (self.children.length <= 0) {
        // apply if valid for our layout item traits
        if (self.horizontalConstraints) self.horizontalConstraints.preferred = 0;
        if (self.verticalConstraints) self.verticalConstraints.preferred = 0;
        return;
      }

      var constraintsF = Function("item", "return item."+ self.orientation+"Constraints");
      var opposedConstraintsF = Function("item", "return item."+
                                         ((self.orientation === 'horizontal')? 'vertical':'horizontal')
                                         +"Constraints");
      var boundedF = function(val, constraints) {
        return (constraints.min$Pix && val < constraints.min$Pix)? constraints.min$Pix :
               (constraints.max$Pix && val > constraints.max$Pix)? constraints.max$Pix :
               val;
      }

      var sz = self.orientation==='horizontal'? self.width : self.height;
      var opposedSz = self.orientation==='horizontal'? self.height : self.width;

      // sum up preferred sizes
      var totalSizes = { min:0, max: sz, preferred: 0, stretchFactor: 0, shrinkFactor: 0 };
      var opposedTotalSizes = { min:0, max: opposedSz, preferred: 0, stretchFactor: 0, shrinkFactor: 0 };
      self.children.forEach(function(child) {
        if ( constraintsF(child) && opposedConstraintsF(child) ) {
          var childCnstr = constraintsF(child);
          var opposedChildCnstr = opposedConstraintsF(child);

          childCnstr.setTotalSize(sz); // for percentages
          opposedChildCnstr.setTotalSize(opposedSz);

          syncConstraints.forEach(function(cnst) {
            totalSizes[cnst] += boundedF(childCnstr[cnst+'$Pix'], childCnstr);
            // find smallest for min
            if ((cnst==='max' && (opposedChildCnstr[cnst+'$Pix'] < opposedTotalSizes[cnst]))
               || (cnst!=='max' && (opposedChildCnstr[cnst+'$Pix'] > opposedTotalSizes[cnst]))) {
              opposedTotalSizes[cnst] = opposedChildCnstr[cnst+'$Pix'];
            }
          });

          // add up stretchFactor and shrinkFactor
          stretchConstraints.forEach( function (factor) {
            if ( childCnstr[factor] > totalSizes[factor] )
              totalSizes[factor] = childCnstr[factor];
            if ( opposedChildCnstr[factor] > opposedTotalSizes[factor] )
              opposedTotalSizes[factor] = opposedChildCnstr[factor];
          });
        }
      });
      // apply if valid for our layout item traits
      syncConstraints.concat(stretchConstraints).forEach(function(cnst) {
        if (constraintsF(self)) constraintsF(self)[cnst] = totalSizes[cnst];
        if (opposedConstraintsF(self)) opposedConstraintsF(self)[cnst] = opposedTotalSizes[cnst];
      });
    }
  }
});
