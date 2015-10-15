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
  name: 'BarExpr',
  extends: 'foam.glang.BaseBarExpr',
  properties: [
    {
      name: 'expr',
      documentation: 'Expression to be run on each object to get a bar size.' +
          'Might be an IntProperty, but any function or expression that ' +
          'returns a number or array of numbers will work. If it does return ' +
          'an array, the bars will be stacked like a ' +
          '$$DOC{ref:"foam.glang.GridBarExpr"}.',
      required: true
    },
    {
      name: 'expr_',
      lazyFactory: function() {
        // Axes are inverted according to the GRID_BY; it was designed for
        // tables where rows go vertically.
        return MAP(this.expr, [].sink);
      }
    },
  ],

  methods: [
    function convertTable_() {
      // See BaseBarExpr for the format here.
      var raw = this.expr_.arg2; // Should be an array.
      var data = [];
      for (var i = 0; i < raw.length; i++) {
        data.push([i].concat(raw[i])); // Concat flattens arrays.
      }
      return data;
    },
  ]
});
