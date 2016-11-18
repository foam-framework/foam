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
  package: 'foam.dao.nativesupport',
  name: 'IdSelectDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: function() {/*
    A DAO decorator that makes a DAO selectable by performing a find for every
    object it gets from another DAO. You would use this on a DAO that only
    supports find to give it the ability to select.
  */},

  properties: [
    {
      name: 'idDao',
      swiftType: 'AbstractDAO',
    },
  ],

  methods: [
    {
      name: 'select',
      swiftCode: function() {/*
        let future = Future()
        let decoratedSink = decorateSink_(sink, options: options)

        var numSelected = 0
        var numFound = 0
        var done = false

        let maybeFinish = {
          if done && numSelected == numFound {
            sink.eof()
            future.set(sink)
          }
        }

        idDao.select(ClosureSink(args: [
          "putFn": FoamFunction(fn: { (args) -> AnyObject? in
            numSelected += 1
            let selectedObj = args[0] as! FObject
            let id = selectedObj.get("id") as! String
            self.find(id, sink: ClosureSink(args: [
              "putFn": FoamFunction(fn: { (args) -> AnyObject? in
                let foundObj = args[0] as! FObject
                numFound += 1
                decoratedSink.put(foundObj)
                maybeFinish()
                return nil
              }),
              "errorFn": FoamFunction(fn: { (args) -> AnyObject? in
                numFound += 1
                decoratedSink.error()
                maybeFinish()
                return nil
              }),
            ]))
            return nil
          }),
        ])).get { _ in
          done = true
          maybeFinish()
        }

        return future
      */},
    },
  ],
});
