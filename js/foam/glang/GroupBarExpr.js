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
  name: 'GroupBarExpr',
  extends: 'foam.glang.BaseBarExpr',
  properties: [
    {
      name: 'xFunc',
      required: true,
      documentation: 'Main (x) axis grouping function. A .f(), in other ' +
          'words. A Property works, but any obj->value projection will do. ' +
          'This splits the data into bars.',
    },
    {
      name: 'acc',
      documentation: 'Accumulator for within each bar. Defaults to COUNT. ' +
          'If acc.value returns an array, (eg. SEQ(SUM(X), SUM(Y))), the bar ' +
          'will be stacked like a $$DOC{ref:"foam.glang.GridBarExpr"}.',
      factory: function() { return COUNT(); }
    },
    {
      name: 'expr_',
      lazyFactory: function() {
        // Axes are inverted according to the GRID_BY; it was designed for
        // tables where rows go vertically.
        return GROUP_BY(this.xFunc, this.acc);
      }
    },
  ],

  methods: [
    function convertTable_() {
      // See BaseBarExpr for the format here.
      var barValues = this.expr_.sortedKeys();
      var data = [];
      for (var i = 0; i < barValues.length; i++) {
        var value = this.expr_.groups[barValues[i]].value;
        data.push([barValues[i]].concat(value)); // Concat flattens arrays.
      }
      return data;
    },
  ]
});
