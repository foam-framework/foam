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
  package: 'foam.mlang',
  name: 'CSVExpr',
  extends: 'UNARY',
  properties: [
    {
      name: 'properties',
      documentation: 'Set this to an array of property names to limit the ' +
          'output to those properties. Otherwise, outputs all properties.',
    },
    {
      name: 'model',
      defaultValueFn: function() {
        return this.values_ && this.values_.length && this.values_[0].model;
      }
    },
    {
      name: 'values_',
      factory: function() {
        return [].sink;
      }
    },
  ],

  methods: [
    function put(obj) {
      this.values_.put(obj);
    },
    function buildCSV() {
      // Returns a string containing the CSV-formatted output.
      // This string might be very large!
      var out = '';
      // Include the header, the labels of the properties.
      var props;
      if (this.properties) {
        props = this.properties.map(function(name) {
          return this.model.getFeature(name);
        }.bind(this));
      } else {
        props = this.model.getRuntimeProperties();
      }

      out += this.buildCSVRow_(props.mapProp('label'));

      // Now each row of data, in the order they were provided to me.
      for (var i = 0; i < this.values_.length; i++) {
        var obj = this.values_[i];
        out += this.buildCSVRow_(props.map(function(p) { return p.f(obj); }));
      }
      return out;
    },
    function buildCSVRow_(values) {
      var out = '';
      for (var i = 0; i < values.length; i++) {
        out += (i > 0 ? ',' : '') + this.buildCSVCell_(values[i]);
      }
      return out + '\r\n';
    },
    function buildCSVCell_(value) {
      if (typeof value === 'undefined') return '';
      if (typeof value !== 'string') value = '' + value;
      if (value.indexOf(',') >= 0 || value.indexOf('"') >= 0) {
        // Quoting required. Embedded quotes get doubled.
        value = value.replace(/"/g, '""');
        return '"' + value + '"';
      } else {
        return value;
      }
    }
  ]
});
