/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
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
  package: 'foam.dao.swift',
  name: 'MultiSink',
  extends: 'foam.dao.swift.Sink',

  documentation: function() {/*
    A sink that takes an array of sinks as a property and will execute all of
    the sink functions (put, remove, eof, etc.) on all of the sinks in the
    array in the order that they're given.
  */},

  properties: [
    {
      name: 'sinks',
      swiftType: '[Sink]',
      swiftFactory: 'return []',
    },
  ],

  methods: [
    {
      name: 'put',
      swiftCode: function() {/*
        for sink in sinks {
          sink.put(obj)
        }
      */},
    },
    {
      name: 'remove',
      swiftCode: function() {/*
        for sink in sinks {
          sink.remove(obj)
        }
      */},
    },
    {
      name: 'reset',
      swiftCode: function() {/*
        for sink in sinks {
          sink.reset()
        }
      */},
    },
    {
      name: 'eof',
      swiftCode: function() {/*
        for sink in sinks {
          sink.eof()
        }
      */},
    },
    {
      name: 'error',
      swiftCode: function() {/*
        for sink in sinks {
          sink.error()
        }
      */},
    },
  ],
});
