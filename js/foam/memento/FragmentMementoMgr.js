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
  package: 'foam.memento',
  name: 'FragmentMementoMgr',

  requires: [
    'foam.memento.WindowHashValue',
    'foam.memento.MemorableTrait'
  ],

  properties: [
    {
      name: 'mementoValue',
    },
    {
      name: 'hash',
      factory: function() {
        return this.WindowHashValue.create();
      },
    }
  ],

  methods: {
    init: function(args) {
      this.SUPER(args);
      this.bind(this.hash, this.mementoValue);
    },

    bind: function(a, b) {
      if ( ! a.get() ) this.initial_ = b.get();
      Events.relate(a, b, this.hashToMemento_.bind(this), this.mementoToHash_, false);
    },

    hashToMemento_: function(h) {
      if ( h[0] === '#' ) h = h.substring(1);
      if ( h.length === 0 ) return this.initial_;
      var split = h.split('&');
      if ( split.length == 1 &&
           split[0].indexOf('=') == -1 )
        return decodeURIComponent(split);

      var memento = { __proto__: MementoProto };

      for ( var i = 0, section ; section = split[i] ; i++ ) {
        var parts = section.split('=');
        parts[0] = decodeURIComponent(parts[0]).split('.');

        var m = memento;

        for ( var j = 0 ; j < parts[0].length - 1 ; j++ ) {
          if ( ! m[parts[0][j]] ) m[parts[0][j]] = {__proto__: MementoProto};
          m = m[parts[0][j]];
        }

        m[parts[0][j]] = decodeURIComponent(parts[1]);
      }

      return memento;
    },

    mementoToHash_: function(m) {
      if ( typeof m != 'object' ) return encodeURIComponent(m);

      var path = '';
      var hash = '';
      function add(o, path) {
        if ( path.length ) path += '.';

        for ( var key in o ) {
          if ( typeof o[key] === 'object' ) add(o[key], path + key);
          else {
            if ( hash.length ) hash += '&';
            hash += encodeURIComponent(path + key) + '=' + encodeURIComponent(o[key]);
          }
        }
      }

      add(m, '');

      return hash;
    }
  }
});
