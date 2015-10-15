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
  name: 'GridBarExpr',
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
      name: 'yFunc',
      required: true,
      documentation: 'Cross (y) axis grouping function. A .f(), like ' +
          '$$DOC{ref:".xFunc"}. Splits one bar\'s data into vertical slices.',
    },
    {
      name: 'acc',
      documentation: 'Accumulator for grid cells. Defaults to COUNT.',
      factory: function() { return COUNT(); }
    },
    {
      name: 'expr_',
      lazyFactory: function() {
        // Axes are inverted according to the GRID_BY; it was designed for
        // tables where rows go vertically.
        return GRID_BY(this.yFunc, this.xFunc, this.acc);
      }
    },
  ],

  methods: [
    function convertTable_() {
      // See BaseBarExpr for the format here.
      var barValues = this.expr_.rows.sortedKeys();
      var data = [];
      for (var i = 0; i < barValues.length; i++) {
        var row = [barValues[i]];
        var cols = this.expr_.rows.groups[barValues[i]];
        var keys = cols.sortedKeys();
        for (var j = 0; j < keys.length; j++) {
          var cell = cols.groups[keys[j]];
          row.push([keys[j], cell ? cell.value : 0]);
        }
        data.push(row);
      }
      return data;
    },
  ]
});
