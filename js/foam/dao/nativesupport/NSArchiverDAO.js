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
  name: 'NSArchiverDAO',
  extends: 'AbstractDAO',

  properties: [
    {
      name: 'path',
      model_: 'StringProperty',
    },
    {
      name: 'filename',
      model_: 'StringProperty',
      swiftPostSet: function() {/*
        let paths = NSSearchPathForDirectoriesInDomains(
            NSSearchPathDirectory.DocumentDirectory,
            NSSearchPathDomainMask.UserDomainMask, true)
        let documentsDirectory: AnyObject = paths[0]
        self.path = documentsDirectory.stringByAppendingPathComponent(newValue)
      */},
    },
  ],
  methods: [
    {
      name: 'getArrayDao',
      swiftReturnType: 'ArrayDAO',
      swiftCode: function() {/*
        var data = NSKeyedUnarchiver.unarchiveObjectWithFile(path) as? [FObject]
        if data == nil { data = [] }
        return ArrayDAO(args: ["dao": data!])
      */},
    },
    {
      name: 'select',
      swiftCode: function() {/*
        return getArrayDao().select(sink, options: options)
      */},
    },
    {
      name: 'find',
      swiftCode: function() {/*
        return getArrayDao().find(id, sink: sink)
      */},
    },
    {
      name: 'put',
      swiftCode: function() {/*
        let dao = getArrayDao()
        let closureSink = ClosureSink(args: [
          "putFn": FoamFunction(fn: { (args) -> AnyObject? in
            if NSKeyedArchiver.archiveRootObject(dao.dao, toFile: self.path) {
              sink.put(obj)
              self.notify_("put", fObj: obj)
            } else {
              sink.error()
            }
            return nil
          }),
          "errorFn": FoamFunction(fn: { (args) -> AnyObject? in
            sink.error()
            return nil
          }),
          "eofFn": FoamFunction(fn: { (args) -> AnyObject? in
            sink.eof()
            return nil
          }),
        ])
        dao.put(obj, sink: closureSink)
      */},
    },
    {
      name: 'remove',
      swiftCode: function() {/*
        let dao = getArrayDao()
        let closureSink = ClosureSink(args: [
          "removeFn": FoamFunction(fn: { (args) -> AnyObject? in
            if NSKeyedArchiver.archiveRootObject(dao.dao, toFile: self.path) {
              sink.remove(obj)
              self.notify_("remove", fObj: obj)
            } else {
              sink.error()
            }
            return nil
          }),
          "errorFn": FoamFunction(fn: { (args) -> AnyObject? in
            sink.error()
            return nil
          }),
          "eofFn": FoamFunction(fn: { (args) -> AnyObject? in
            sink.eof()
            return nil
          }),
        ])
        dao.remove(obj, sink: closureSink)
      */},
    },
  ],
});
