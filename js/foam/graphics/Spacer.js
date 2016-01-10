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
  name: 'Spacer',
  extends: 'foam.graphics.CView',

  traits: [ 'foam.patterns.layout.LayoutItemHorizontalTrait', 'foam.patterns.layout.LayoutItemVerticalTrait' ],
  documentation: function() {/* A $$DOC{ref:'foam.graphics.CView'} layout spacer. No children
      or painting is supported. */},

  methods: {
    addChild: function() {/* Does nothing. */},
    removeChild: function() {/* Does nothing. */},
    paintSelf: function() {/* Does nothing. */},
    paint: function() {/* Does nothing. */},
    init: function() {
      this.SUPER();

      // change defaults
      this.horizontalConstraints.preferred = 0;
      this.verticalConstraints.preferred = 0;

      this.horizontalConstraints.stretchFactor$ = this.stretchFactor$;
      this.verticalConstraints.stretchFactor$ = this.stretchFactor$;

      // apply fixed settings if specified
      if (this.fixedWidth) this.fixedWidth = this.fixedWidth;
      if (this.fixedHeight) this.fixedHeight = this.fixedHeight;
    }
  },

  properties: [
    {
      name:  'fixedWidth',
      label: 'Fixed Width',
      type:  'String',
      defaultValue: '',
      help: "Optional shortcut to set a fixed width (integer or percent value).",
      documentation: "Optional shortcut to set a fixed width (integer or percent value).",
      postSet: function() {
        if (this.fixedWidth && this.horizontalConstraints) {
          this.horizontalConstraints.min = this.fixedWidth;
          this.horizontalConstraints.max = this.fixedWidth;
          this.horizontalConstraints.preferred = this.fixedWidth;
        }
      }
    },
    {
      name:  'fixedHeight',
      label: 'Fixed Height',
      // type:  'ConstraintValue',
      defaultValue: '',
      help: "Optional shortcut to set a fixed height (integer or percent value).",
      documentation: "Optional shortcut to set a fixed width (integer or percent value).",
      postSet: function() {
        if (this.fixedHeight && this.verticalConstraints) {
          this.verticalConstraints.min = this.fixedHeight;
          this.verticalConstraints.max = this.fixedHeight;
          this.verticalConstraints.preferred = this.fixedHeight;
        }
      }
    },
    {
      name: 'stretchFactor',
      type: 'Int',
      defaultValue: 1
    }
  ]
});
