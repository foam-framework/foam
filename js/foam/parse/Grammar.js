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
  package: 'foam.parse',
  name: 'Grammar',

  onLoad: function() {
    this.parser__ = this.createParser();
  },

  properties: [
    {
      type: 'Boolean',
      name: 'debug'
    }
  ],

  methods: [
    function parseString(str) {
      var ps = this.stringPS;
      ps.str = str;
      var res = this.parse(this.START, ps);

      return res && res.value;
    },

    function parse(parser, pstream) {
      //    if ( this.debug ) console.log('parser: ', parser, 'stream: ',pstream);
      if ( this.debug && pstream.str_ ) {
        console.log(new Array(pstream.pos).join('.'), pstream.head);
        console.log(pstream.pos + '> ' + pstream.str_[0].substring(0, pstream.pos) + '(' + pstream.head + ')');
      }
      var ret = parser.call(this, pstream);
      if ( this.debug ) {
        console.log(parser + ' ==> ' + (!!ret) + '  ' + (ret && ret.value));
      }
      return ret;
    },

    /** Export a symbol for use in another grammar or stand-alone. **/
    function exportSym(str) {
      return this[str].bind(this);
    },

    function addAction(sym, action) {
      var p = this[sym];
      this[sym] = function(ps) {
        var val = ps.value;
        var ps2 = this.parse(p, ps);

        return ps2 && ps2.setValue(action.call(this, ps2.value, val));
      };

      this[sym].toString = function() { return '<<' + sym + '>>'; };
    },

    function addActions(map) {
      for ( var key in map ) this.addAction(key, map[key]);

      return this;
    }
  ]
});
