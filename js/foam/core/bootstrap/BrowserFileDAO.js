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
    },
    {
      name: 'rootPath',
      factory: function() {
        return this.window.FOAM_BOOT_DIR + '../js/';
      }
    },
    'looking_'
  ],

  methods: {
    toURL_: function(key) {
      return this.rootPath + key.replace(/\./g, '/') + '.js';
    },
    find: function(key, sink) {
      // Hack to avoid console error when not in debug mode.
      // Should be generalized somehow. KGR
      if ( ! DEBUG && key === 'DocumentationProperty' ) {
        sink && sink.error();
        return;
      }

      if ( this.preload[key] ) {
        sink && sink.put && sink.put(this.preload[key]);
        delete this.preload[key];
        return;
      }

      if ( this.pending[key] ) {
        this.pending[key].push(sink);
        return;
      }

      this.pending[key] = [sink];

      var tag = this.document.createElement('script');
      var looking = key;

      var onerror = function() {
        var pending = this.pending[key];
        delete this.pending[key];
        for ( var i = 0 ; i < pending.length ; i++ ) {
          pending[i] && pending[i].error && pending[i].error.apply(null, arguments);
        }
        tag.remove();
      }.bind(this);

      tag.callback = function(data, latch) {
        var work = [anop];
        var obj = JSONUtil.mapToObj(this.X, data, undefined, work);

        if ( ! obj ) throw new Error('Failed to decode data: ' + data);

        if ( looking === obj.id ) looking = null;

        if ( ! this.pending[obj.id] ) {
          if ( latch ) {
            latch(data);
          } else {
            // Workaround for legacy apps that include extra models via
            // additional script tags.
            this.preload[obj.id] = obj;
          }
          return;
        }

        aseq.apply(null, work)(
          function(ret) {
            var sinks = this.pending[obj.id];
            delete this.pending[obj.id];
            if ( sinks ) {
              for ( var i = 0; i < sinks.length ; i++ ) {
                var sink = sinks[i];
                sink && sink.put && sink.put(obj);
              }
            }
          }.bind(this));
      }.bind(this);

      tag.onload = function() {
        if ( looking != null ) {
          onerror();
        }
        tag.remove();
      };
      tag.onerror = onerror;

      tag.src = this.toURL_(key);

      this.document.head.appendChild(tag);
    }
  }
});
