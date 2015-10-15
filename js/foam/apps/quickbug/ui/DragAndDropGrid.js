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
  name: 'DragAndDropGrid',
  package: 'foam.apps.quickbug.ui',
  extends: 'GridByExpr',

  requires: [
    'foam.apps.quickbug.ui.IssueDropCell'
  ],

  properties: [
    {
      name: 'dao'
    },
    {
      name: 'versionParser',
      factory: function() {
        return {
          __proto__: grammar,

          START: repeat(sym('component'), optional(sym('separator'))),

          component: alt(
            sym('number'),
            sym('string')
          ),

          digit: range('0', '9'),

          number: plus(sym('digit')),

          string: str(plus(not(alt(sym('digit'), sym('separator')), anyChar))),

          separator: alt('.', '-')
        }.addActions({
          number: function(v) { return parseInt(v.join('')); }
        });
      }
    }
  ],

  methods: {
    createVersionComparator_: function() {
      var m = {};
      var parser = this.versionParser;

      function toKey(o) {
        return m[o] || ( m[o] = parser.parseString(o) );
      }

      return function(o1, o2) {
        o1 = toKey(o1);
        o2 = toKey(o2);

        for ( var i = 0 ; ; i++ ) {
          if ( i == o1.length && i == o2.length ) return 0;
          if ( i == o1.length ) return -1;
          if ( i == o2.length ) return  1;
          if ( typeof o1[i] === 'string' && typeof o2[i] !== 'string' ) return  1;
          if ( typeof o1[i] !== 'string' && typeof o2[i] === 'string' ) return -1;
          var c = o2.compareTo(o1);
          if ( c !== 0 ) return c;
        }
      };
    },

    // Milestone and Iteration use the following specialized compator rule:
    //   1. Undefined values come first
    //   2. Next, number values are sorted in descending order
    //   3. Next, string values are sorted in ascending order
    // TODO: this can be moved to the Model now.
    sortAxis: function(values, f) {
      return values.sort(
        f.name === 'milestone' || f.name === 'iteration' ?
          this.createVersionComparator_() :
          f.compareProperty);
    },
    renderCell: function(x, y, data) {
      var cell = this.IssueDropCell.create({
        data: data,
        dao: this.dao,
        props: [this.xFunc, this.yFunc],
        values: [x, y]
      }, this.Y);
      this.children.push(cell);
      return cell.toHTML();
    },
    clone: function() {
      var clone = this.SUPER();
      clone.dao = this.dao;
      return clone;
    }
  }
});
