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
  name: 'LayoutItemVerticalTrait',

  requires: [
    'foam.patterns.layout.LayoutItemLinearConstraints',
    'foam.patterns.layout.ConstraintProperty'
  ],

  documentation: function() {/* This trait enables an item to be placed in
                                a vertical layout. */},

  properties: [
    {
      name: 'verticalConstraints',
      // type: 'foam.patterns.layout.LayoutItemLinearConstraints',
      documentation: function() {/* Vertical layout constraints. If undefined,
                              no constraints or preferences are assumed. */},
      factory: function() {
        return this.LayoutItemLinearConstraints.create();
      },
      view:'foam.ui.DetailView',
      postSet: function() {
        this.horizontalConstraints.subscribe(['constraintChange'], this.doConstraintChange);
      }
    }
  ],

  listeners: [
    {
      name: 'doConstraintChange',
      code: function(evt) {
        this.publish(['constraintChange'], null);
      }
    }
  ]
});
