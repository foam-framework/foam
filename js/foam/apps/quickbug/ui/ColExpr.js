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
  name: 'ColExpr',
  package: 'foam.apps.quickbug.ui',
  properties: [
    {
      name: 'values',
      factory: function() { return []; }
    }
  ],
  methods: {
    put: function(v) { this.values.push(v); },

    toHTML: function() {
      var s = '';
      var vs = this.values;
      if( vs.length && vs[0].issue ) {
        vs.sort(function(o1, o2) {
          return o1.issue.id.compareTo(o2.issue.id);
        });
      }
      for ( var i = 0 ; i < vs.length ; i++ ) s += vs[i].toHTML ? vs[i].toHTML() : vs[i];
      return s;
    },

    initHTML: function() {
      for ( var i in this.values ) {
        var o = this.values[i];
        o.initHTML && o.initHTML();
      }
    }
  }
});
