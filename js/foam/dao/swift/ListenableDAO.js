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
  name: 'ListenableDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: function() {/*
    A DAO decorator that makes a DAO listenable by keeping track of objects that
    have been selected, found, put, and removed and calls notify_ when new
    objects are found, updated, or removed during a select.
  */},

  properties: [
    {
      name: 'cache',
      swiftType: '[String:FObject]',
      swiftFactory: 'return [:]',
    },
  ],
  methods: [
    {
      name: 'select',
      swiftCode: function() {/*
        var unseen = Set(cache.keys)
        let puttingSink = ClosureSink(args: [
          "putFn": FoamFunction(fn: { (args) -> AnyObject? in
            let fobj = args[0] as! FObject
            let id = fobj.get("id") as! String
            unseen.remove(id)
            if !equals(self.cache[id], b: fobj) {
              self.cache[id] = fobj
              self.notify_("put", fObj: fobj)
            }
            return nil
          }),
          "errorFn": FoamFunction(fn: { (args) -> AnyObject? in
            // If an error occurs, clear the set of unseen objects so we don't
            // notify_ that things have been removed because we don't know for
            // sure if anything has actually been removed.
            unseen.removeAll()
            return nil
          }),
          "eofFn": FoamFunction(fn: { (args) -> AnyObject? in
            for id in unseen {
              self.notify_("remove", fObj: self.cache[id])
              self.cache.removeValueForKey(id)
            }
            self.notify_("eof", fObj: nil)
            return nil
          }),
        ])

        let multiSink = MultiSink(args: ["sinks": [sink, puttingSink]])
        let future = Future()
        self.delegate.select(multiSink, options: options).get { _ in
          future.set(sink)
        }
        return future
      */},
    },
    {
      name: 'put',
      swiftCode: function() {/*
        let puttingSink = ClosureSink(args: [
          "putFn": FoamFunction(fn: { (args) -> AnyObject? in
            let obj = args[0] as! FObject
            let id = obj.get("id") as! String
            self.cache[id] = obj
            return nil
          }),
        ])

        let multiSink = MultiSink(args: ["sinks": [sink, puttingSink]])
        self.delegate.put(obj, sink: multiSink)
      */},
    },
    {
      name: 'remove',
      swiftCode: function() {/*
        let puttingSink = ClosureSink(args: [
          "putFn": FoamFunction(fn: { (args) -> AnyObject? in
            let obj = args[0] as! FObject
            let id = obj.get("id") as! String
            self.cache.removeValueForKey(id)
            return nil
          }),
        ])

        let multiSink = MultiSink(args: ["sinks": [sink, puttingSink]])
        self.delegate.remove(obj, sink: multiSink)
      */},
    },
  ],
});
