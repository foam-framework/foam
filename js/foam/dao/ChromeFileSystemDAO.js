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
  extendsModel: 'AbstractDAO',

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
        return this.ChromeFileSystem.create();
      }
    }
  ],

  methods: [
    {
      name: 'put',
      code: function(o, sink) {
        this.cfs.awrite(o.path, o.contents)(function(o, sink, status) {
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
    }// ,
    // {
    //   name: 'select',
    //   code: function(sink, options) {
    //     return this.cfs.aentriesAll(this.decorateSink_(sink, options));
    //   }
    // }
  ],

  actions: [
    {
      name: 'testWrite',
      action: function() {
        this.cfs.awrite('test/test.txt', 'Hello world!\n')(function() {
          console.log('Write', arguments);
          this.cfs.clearError();
        }.bind(this));
      }
    },
    {
      name: 'testRead',
      action: function() {
        this.cfs.aread('test/test.txt')(function() {
          console.log('Read', arguments);
          this.cfs.clearError();
        }.bind(this));
      }
    },
    {
      name: 'testEntries',
      action: function() {
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
      action: function() {
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
