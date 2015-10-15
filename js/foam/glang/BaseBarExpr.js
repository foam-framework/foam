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
  package: 'foam.glang',
  name: 'BaseBarExpr',
  extends: 'foam.ui.DetailView',
  properties: [
    {
      name: 'width',
      required: true,
      units: 'pixels',
      documentation: 'Width of the svg element in pixels.',
    },
    {
      name: 'height',
      required: true,
      units: 'pixels',
      documentation: 'Height of the svg element in pixels.',
    },
    {
      name: 'expr_',
      documentation: 'Should be overridden by subclasses to have a factory.',
    },
    {
      name: 'colors',
      // Defaulting to Google colours.
      documentation: 'Bars in each stack will be coloured according to this ' +
          'mapping. More colours will be generated if there are not enough. ' +
          'Can be an object or array; either way it is indexed according to ' +
          'the key for a [key, value] bar chunk, or by index-1 for a value ' +
          'chunk.',
      defaultValue: [
        '#4285f4', // blue
        '#db4437', // red
        '#0f9d58', // green
        '#f4b400'  // yellow
      ]
    },
    {
      name: 'paddingRatio',
      documentation: 'The ratio of padding to bar width.',
      defaultValue: 0.2,
    },
    {
      name: 'stashedOutput_',
    },
    {
      name: 'className',
      defaultValue: ''
    },
  ],

  methods: [
    function put(obj) {
      this.expr_.put(obj);
    },
    function eof() {
      this.expr_.eof && this.expr_.eof();
      this.paint_();
    },
    function convertTable_() {
      // Abstract, to be implemented by subclasses. Returns an array thus:
      // [[bar1, stack1_1, stack1_2, ..., stack1_N],
      //  [bar2, stack2_1, stack2_2, ..., stack2_N],
      //  ...
      //  [barM, stackM_1, stackM_2, ..., stackM_N]]
      // Where each stackM_1 is a either a value, or a [key, value] pair.
      // If the former, the first color is used. If the latter, the
      // corresponding color is used (or generated).
      throw new Error('Abstract method BaseBarExpr.convertTable_ called.');
    },

    function paint_() {
      var self = this;
      var data = this.convertTable_();

      // Need to find the largest total bar height in any x-position.
      var largest = 0;
      for (var i = 0; i < data.length; i++) {
        var total = 0;
        for (var j = 1; j < data[i].length; j++) {
          var d = data[i][j];
          if (Array.isArray(d)) d = d[1];
          total += d;
        }
        if (total > largest) largest = total;
      }
      // That determines the vertical scale.
      var yScale = this.height / largest;

      // For the horizontal scale, we divide the space into the number of bars
      // available. The actual bar width is adjusted by the padding ratio.
      var barPadWidth = this.width / data.length;
      var barWidth = Math.floor(barPadWidth * (1 - this.paddingRatio));

      var out = '';
      for (var i = 0; i < data.length; i++) {
        var x = Math.floor(i * barPadWidth);
        var baseY = 0;
        for (var j = 1; j < data[i].length; j++) {
          var d = data[i][j];
          var value = Array.isArray(d) ? d[1] : d;
          var h = Math.floor(yScale * value);
          var colorKey = Array.isArray(d) ? d[0] : j - 1;
          var color = this.colors[colorKey] || this.colors[j - 1];
          out += '<rect fill="' + color +
              '" width="' + barWidth + 'px" height="' + h + 'px" ' +
              'x="' + x + 'px" y="' + (this.height - baseY - h) + 'px" />';
          baseY += h;
        }
      }

      if (this.$) this.$.innerHTML = out;
      else this.stashedOutput_ = out;
    },
  ],

  templates: [
    function toHTML() {/*
      <svg id="%%id" %%cssClassAttr() width="<%= this.width %>px"
          height="<%= this.height %>px">
        <% if (this.stashedOutput_) {
          out(this.stashedOutput_);
          this.stashedOutput_ = '';
        } %>
      </svg>
    */},
  ]
});
