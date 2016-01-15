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
  name:  'MarginTrait',

  requires: ['foam.patterns.layout.LayoutItemLinearConstraintsProxy'],

  documentation: function() {/*
      Adds a margin around one child item. Requires $$DOC{ref:'.addChild'} and
      $$DOC{ref:'.removeChild'} methods on trait users. Use
      $$DOC{ref:'foam.patterns.layout.LayoutItemHorizontalTrait'} and
      $$DOC{ref:'foam.patterns.layout.LayoutItemVerticalTrait'} alongside this trait.
    */},

  models: [
    {
      model_: 'Model',
      name: 'MarginProxy',
      extends: 'foam.patterns.layout.LayoutItemLinearConstraintsProxy',

      documentation: function() {/* Adds an $$DOC{ref:'foam.patterns.layout.MarginTrait.MarginProxy.addAmount'} to the proxied constraints. */},

      properties: [
        {
          type: 'Int',
          name: 'addAmount',
          documentation: function() {/* The amount to add to the proxied pixel values. */},
          defaultValue: 0,
          postSet: function(old,nu) {
            this.preferred = this.data.preferred$Pix + nu;
            this.max = this.data.max$Pix + nu;
            this.min = this.data.min$Pix + nu;
          }
        }
      ],

      methods: {
        bind: function(nu) {
          // no SUPER, we don't want it
          if (!nu) return;

          var mapFn = function(val) {
            return val + this.addAmount
          }.bind(this);

          Events.map(nu.preferred$Pix$, this.preferred$, mapFn);
          Events.map(nu.max$Pix$, this.max$, mapFn);
          Events.map(nu.min$Pix$, this.min$, mapFn);

          Events.follow(nu.stretchFactor$, this.stretchFactor$);
          Events.follow(nu.shrinkFactor$, this.shrinkFactor$);
        }
      }
    }
  ],

  properties: [
    {
      type: 'Int',
      name:  'top',
      label: 'Top Margin',
      documentation: function() {/* Margin in pixels. */},
      defaultValue: 0
    },
    {
      type: 'Int',
      name:  'left',
      label: 'Left Margin',
      documentation: function() {/* Margin in pixels. */},
      defaultValue: 0
    },
    {
      type: 'Int',
      name:  'right',
      label: 'Right Margin',
      documentation: function() {/* Margin in pixels. */},
      defaultValue: 0
    },
    {
      type: 'Int',
      name:  'bottom',
      label: 'Bottom Margin',
      documentation: function() {/* Margin in pixels. */},
      defaultValue: 0
    },

  ],
  methods: {
    init: function() {
      this.SUPER();
      this.horizontalConstraints = this.MarginProxy.create({},this.Y);
      this.verticalConstraints = this.MarginProxy.create({},this.Y);

      Events.dynamicFn(
        function(){ this.top; this.left; this.right; this.bottom;
                    this.width; this.height; }.bind(this),
        this.updateMargins);
    },

    addChild: function(child) { /* Adds a child $$DOC{ref:'foam.graphics.CView'} to the scene
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
    removeChild: function(child) { /* Removes the child $$DOC{ref:'foam.graphics.CView'} from the scene. */
      // unlisten
      if (this.verticalConstraints) this.verticalConstraints.data = undefined;
      if (this.horizontalConstraints) this.horizontalConstraints.data = undefined;

      this.SUPER(child);
    }
  },

  listeners: [
    {
      name: 'updateMargins',
      //isFramed: true,
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
    }
  ]
});
