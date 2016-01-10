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
  package: 'foam.graphics',
  name: 'LockToPreferredLayout',
  extends: 'foam.graphics.CView',

  documentation: function() {/*
      A simple layout for items not already in a layout. It will take the preferred
      size of its child and set the width and height of itself to match.
    */},

  properties: [
    {
      name: 'layoutDirty',
      type: 'Boolean',
      defaultValue: true,
      hidden: true
    }
  ],

  methods: {
    addChild: function(child) { /* Adds a child $$DOC{ref:'foam.graphics.CView'} to the scene
                                   under this. Add our listener for child constraint
                                   changes. */
      this.SUPER(child);

      // listen for changes to child layout constraints
      if (child.horizontalConstraints) {
        child.horizontalConstraints.subscribe(['constraintChange'], this.performLayout);
      }
      if (child.verticalConstraints) {
        child.verticalConstraints.subscribe(['constraintChange'], this.performLayout);
      }
    },

    removeChild: function(child) { /* Removes a child $$DOC{ref:'foam.graphics.CView'} from the scene. */
      // unlisten
      if (child.horizontalConstraints) {
        child.horizontalConstraints.unsubscribe(['constraintChange'], this.performLayout);
      }
      if (child.verticalConstraints) {
        child.verticalConstraints.unsubscribe(['constraintChange'], this.performLayout);
      }

      this.SUPER(child);
    },

    paintSelf: function(canvas) {
      /* To reduce the number of potential re-layout operations, only calculate
      a dirty layout when painting. A property change will cause a repaint,
      to $$DOC{ref:'foam.patterns.layout.LinearLayoutTrait.layoutDirty'} changing to true will
      cause a repaint. */
      this.SUPER(canvas);

      // only calculate layout on paint
      if ( this.layoutDirty ) {
        this.calculateLayout();
      }
    },

    calculateLayout: function() {
      /* Locks our size to the child's preferred size. */
      this.layoutDirty = false;

      if (this.children[0]) {
        if (this.children[0].horizontalConstraints) {
          this.width =  this.children[0].horizontalConstraints.preferred;
          this.children[0].width = this.width;
        }
        if (this.children[0].verticalConstraints) {
          this.height = this.children[0].verticalConstraints.preferred;
          this.children[0].height = this.height;
        }
      }
    }

  },
  listeners: [
    {
      name: 'performLayout',
      //isFramed: true,
      code: function() {
        this.layoutDirty = true;
      }
    }
  ]

});
