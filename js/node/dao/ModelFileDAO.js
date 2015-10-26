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
  name: 'ModelFileDAO',
  package: 'node.dao',

  properties: [
    {
      name: 'classpath',
      factory: function() {
        return global.NODE_CLASSPATH ||
            (global.FOAM_BOOT_DIR + '/../js');
      }
    },
    {
      name: 'pending',
      factory: function() { return {}; }
    },
    {
      name: 'preload',
      factory: function() { return {}; }
    },
    'looking_'
  ],

  methods: [
    function find(key, sink) {
      if ( this.preload[key] ) {
        sink && sink.put && sink.put(this.preload[key]);
        delete this.preload[key];
        return;
      }

      var fileName = path.join(this.classpath, key.replace(/\./g, '/') + '.js');
      if ( fileName[0] != '/' && ( fileName.substring(1,3) != ':\\'  ) ) fileName = path.join(process.cwd(), fileName);

      if ( this.pending[key] ) {
        this.pending[key].push(sink);
        return;
      }

      this.pending[key] = [sink];

      var old = global.__DATACALLBACK;
      try {
        // require() is a synchronous call to a FOAM file that contains
        // calls to CLASS().  CLASS has been redirected to call __DATACALLBACK
        // which will synchronoulsy check this.looking_.  This makes the
        // this.looking_ safe even though it appears to not be re-entrant.
        global.__DATACALLBACK = this.onData;
        global.__DATACALLBACK.sourcePath = fileName;
        this.looking_ = key;

        require(fileName);

        if ( this.looking_ ) {
          throw "Model with id: " + key + " not found in " + fileName;
        }
      } catch(e) {
        if ( e.__DAO_ERROR ) {
          throw e.exception;
        } else {
          // in case of nested ModelFileDAOs retrying the load, record this as an
          // interested party should it succeed.
          this.regForRetry();
          sink && sink.error && sink.error('Error loading model', key, e, e.stack);
        }
      } finally {
        global.__DATACALLBACK = old;
        this.unregForRetry();
      }
    },
    function regForRetry() {
      if ( ! global.__RETRY_DATACALLBACKS ) global.__RETRY_DATACALLBACKS = {};
      global.__RETRY_DATACALLBACKS[this.$UID] = this.onRetryOk;
    },
    function unregForRetry() {
      if ( global.__RETRY_DATACALLBACKS && global.__RETRY_DATACALLBACKS[this.$UID] ) {
        delete global.__RETRY_DATACALLBACKS[this.$UID];
      }
    }
  ],

  listeners: [
    {
      name: 'onRetryOk',
      code: function(obj) {
        /* When we error, this may trigger another DAO in an OrDAO to retry
          the load and succeed. This listener is globally registered in case
          that happens, triggered from onData. */
        if ( this.looking_ === obj.id ) this.looking_ = null;
      }
    },
    {
      name: 'onData',
      code: function(data, latch) {
        this.unregForRetry(); // data came in, so no retry required.

        var work = [anop];
        var obj = JSONUtil.mapToObj(this.X, data, undefined, work);

        if ( ! obj ) {
          throw new Error("Failed to decode data: " + data);
        }

        if ( this.looking_ === obj.id ) {
          this.looking_ = null;
        }
        // notify other ModelFileDAOs above us that the object was found
        // this DAO must have been a fallback
        if ( global.__RETRY_DATACALLBACKS ) {
          for ( key in global.__RETRY_DATACALLBACKS ) {
            global.__RETRY_DATACALLBACKS[key](obj);
          }
        }

        if ( ! this.pending[obj.id] ) {
          if ( latch ) latch(obj);
          else {
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
            try {
              for ( var i = 0; i < sinks.length ; i++ ) {
                var sink = sinks[i];
                sink && sink.put && sink.put(obj);
              }
            } catch (e) {
              throw {
                __DAO_ERROR: true,
                exception: e
              };
            }
          }.bind(this));
      }
    }
  ]
});
