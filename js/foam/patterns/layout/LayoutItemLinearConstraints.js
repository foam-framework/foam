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
  name: 'LayoutItemLinearConstraints',

  requires: ['foam.patterns.layout.ConstraintProperty'],

  documentation: function() {/* The information layout items provide for a
                            single axis of linear layout. */},

  properties: [
    {
      model_: 'foam.patterns.layout.ConstraintProperty',
      defaultValue: 100,
      name: 'preferred',
      documentation: function() {/* The preferred item size. */},
      // type: 'foam.patterns.layout.ConstraintProperty'
    },
    {
      model_: 'foam.patterns.layout.ConstraintProperty',
      defaultValue: 0,
      name: 'min',
      documentation: function() {/* The minimum size. */},
      // type: 'foam.patterns.layout.ConstraintProperty'
    },
    {
      model_: 'foam.patterns.layout.ConstraintProperty',
      defaultValue: 999999999,
      name: 'max',
      documentation: function() {/* The maximum size. */},
      // type: 'foam.patterns.layout.ConstraintProperty'
    },
    {
      type: 'Int',
      name: 'stretchFactor',
      defaultValue: 0,
      documentation: function() {/* If zero, item will not grow unless all other
            items are ungrowable. If above zero,
            indicates the proportion of space this item should take (versus the
            total of all stretch factors in the layout). */},
    },
    {
      type: 'Int',
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
      if (!this.constraintValue_TotalSize_ || this.constraintValue_TotalSize_ !== size) {
        this.constraintValue_TotalSize_ = size;
      }
    },
    init: function() {
      this.SUPER();

      this.min$.addListener(this.doConstraintChange);
      this.max$.addListener(this.doConstraintChange);
      this.preferred$.addListener(this.doConstraintChange);
      this.stretchFactor$.addListener(this.doConstraintChange);
      this.shrinkFactor$.addListener(this.doConstraintChange);
    }
  },
  listeners: [
    {
      name: 'doConstraintChange',
      code: function(evt) {
        this.publish(['constraintChange'], null);
      }
    }
  ]
});
