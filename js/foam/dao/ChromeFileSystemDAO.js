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
  package: 'foam.dao',
  name: 'ChromeFileSystemDAO',
  extends: 'AbstractDAO',

  requires: [
    'foam.dao.ChromeFileSystem'
  ],

  imports: [
    'console'
  ],

  properties: [
    {
      name: 'cfs',
      factory: function() {
        return this.ChromeFileSystem.create({}, this.Y);
      },
      postSet: function(old, nu) {
        if ( old === nu ) return;
        if ( old ) old.readyState$.removeListener(this.onReadyStateChange);
        if ( nu ) {
          nu.readyState$.addListener(this.onReadyStateChange);
          this.onReadyStateChange();
        }
      }
    },
    {
      type: 'Array',
      name: 'backlog_',
      factory: function() { return []; }
    },
  ],

  methods: [
    {
      name: 'put',
      code: function(o, sink) {
        if ( this.cfs.readyState === 'LOADING' ) {
          this.backlog_.push(['put', arguments]);
          return;
        }
        if ( this.cfs.readyState !== 'READY' ) {
          sink && sink.error && sink.error(this.cfs.error);
          return;
        }

        console.log('put', o);

        this.cfs.awrite(o.path, o.contents, o.mimeType)(function(o, sink, status) {
          if ( status.error ) {
            sink && sink.error && sink.error(status.error);
            return status.error;
          }
          if ( status.mimeType ) o.mimeType = status.mimeType;
          sink && sink.put && sink.put(o);
          return o;
        }.bind(this, o, sink));
      }
    },
    {
      name: 'find',
      code: function(hash, sink) {
        if ( this.cfs.readyState === 'LOADING' ) {
          this.backlog_.push(['find', arguments]);
          return;
        }
        if ( this.cfs.readyState !== 'READY' ) {
          sink && sink.error && sink.error(this.cfs.error);
          return;
        }

        this.console.assert(hash.path);
        this.cfs.aread(hash.path)(function(sink, o) {
          if ( o.error ) {
            sink && sink.error && sink.error(o.error);
            return o.error;
          }
          sink && sink.put && sink.put(o);
          return o;
        }.bind(this, sink));
      }
    },
    {
      name: 'isFileError',
      code: function(err) {
        return this.cfs.isFileError(err);
      }
    }
  ],

  listeners: [
    {
      name: 'onReadyStateChange',
      code: function() {
        if ( ! this.cfs.readyState === 'LOADING' ) return;
        var calls = this.backlog_;
        for ( var i = 0; i < calls.length; ++i ) {
          this[calls[i][0]].apply(this, calls[i][1]);
        }
        this.backlog_ = [];
      }
    }
  ],

  actions: [
    {
      name: 'testWrite',
      code: function() {
        this.cfs.awrite('test/test.txt', 'Hello world!\n', 'text/plain')(function() {
          console.log('Write', arguments);
          this.cfs.clearError();
        }.bind(this));
      }
    },
    {
      name: 'testRead',
      code: function() {
        this.cfs.aread('test/test.txt')(function() {
          console.log('Read', arguments);
          this.cfs.clearError();
        }.bind(this));
      }
    },
    {
      name: 'testEntries',
      code: function() {
        this.cfs.aentries(
            '/test',
            {
              put: function(o) { console.log('Put', o); },
              error: function(e) { console.log('Error', e); },
              eof: function() { console.log('EOF'); }
            })(function() {
              console.log('Entries done', arguments);
              this.cfs.clearError();
            }.bind(this));
      }
    },
    {
      name: 'testEntriesAll',
      code: function() {
        this.cfs.aentriesAll(
            '/',
            {
              put: function(o) { console.log('Put', o.path); },
              error: function(e) { console.log('Error', e); },
              eof: function() { console.log('EOF'); }
            })(function() {
              console.log('Entries all done', arguments);
              this.cfs.clearError();
            }.bind(this));
      }
    }
  ]
});
