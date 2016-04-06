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
  name: 'SwiftArrayDAO',
  extends: 'AbstractDAO',

  properties: [
    {
      name: 'dao',
      swiftType: '[FObject]',
      swiftDefaultValue: '[]',
    },
  ],
  methods: [
    {
      name: 'select',
      swiftCode: function() {/*
        let decoratedSink = decorateSink_(sink, options: options)
        for obj in dao {
          decoratedSink.put(obj)
        }
        sink.eof()
        return Future().set(sink)
      */},
    },
    {
      name: 'put',
      swiftCode: function() {/*
        var found = false
        for (index, fobj) in dao.enumerate() {
          if equals(fobj.get("id"), b: obj.get("id")) {
            dao[index] = obj
            found = true
            break
          }
        }
        if !found { dao.append(obj) }
        sink.put(obj)
        notify_("put", fObj: obj)
      */},
    },
    {
      name: 'remove',
      swiftCode: function() {/*
        let index = dao.indexOf(obj)
        if index != nil {
          dao.removeAtIndex(index!)
          sink.put(obj)
          notify_("remove", fObj: obj)
        }
      */},
    },
    {
      name: 'find',
      swiftCode: function() {/*
        for fobj in dao {
          if equals(fobj.get("id"), b: id) {
            sink.put(fobj)
            return
          }
        }
        sink.error()
      */},
    },
  ],
});
