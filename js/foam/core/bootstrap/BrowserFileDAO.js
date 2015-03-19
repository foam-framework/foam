/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
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

MODEL({
  package: 'foam.core.bootstrap',
  name: 'BrowserFileDAO',
  
  imports: [
    'document',
    'window'
  ],

  properties: [
    {
      name: 'pending',
      factory: function() { return {}; }
    },
    {
      name: 'preload',
      factory: function() { return {}; }
    }
  ],

  methods: {
    toURL_: function(key) {
      return window.FOAM_BOOT_DIR + '../js/' + key.replace(/\./g, '/') + '.js';
    },
    find: function(key, sink) {
      if ( this.preload[key] ) {
        sink && sink.put && sink.put(this.preload[key]);
        return;
      }

      if ( this.pending[key] ) this.pending[key].push(sink);
      else this.pending[key] = [sink];

      var tag = this.document.createElement('script');
      tag.src = this.toURL_(key);
      tag.onload = function() {
        tag.remove();
      };

      tag.onerror = function() {
        for ( var i = 0 ; i < this.pending[key].length ; i++ ) {
          this.pending[key][i] && this.pending[key][i].error && this.pending[key][i].error.apply(null, arguments);
        }
        tag.remove();
      }.bind(this);

      this.document.head.appendChild(tag);
    }
  },

  listeners: [
    {
      name: 'onData',
      code: function(data, src) {
        var work = [anop];
        var obj = JSONUtil.mapToObj(this.X, data, undefined, work);

        if ( ! obj ) {
          throw new Error("Failed to decode data: " + data);
        }
        if ( ! this.pending[obj.id] ) {
          // Workaround for legacy apps that include extra models via
          // additional script tags.
          this.preload[obj.id] = obj;
          return;
        }

        aseq.apply(null, work)(
          function(ret) {
            for ( var i = 0 ; i < this.pending[obj.id].length ; i++ ) {
              var sink = this.pending[obj.id][i];
              sink && sink.put && sink.put(obj);
            }
          }.bind(this));
      }
    }
  ]
});
