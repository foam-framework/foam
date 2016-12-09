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
  name: 'ArrayDAO',
  extends: 'AbstractDAO',

  properties: [
    {
      name: 'dao',
      type: 'Array',
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
      javaCode: function() {/*
        Sink decoratedSink = decorateSink_(sink, options);
        for (FObject obj : getDao()) {
          decoratedSink.put(obj);
        }
        sink.eof();
        CompletableFuture<Sink> future = new CompletableFuture<>();
        future.complete(sink);
        return future;
      */},
    },
    {
      name: 'put',
      swiftCode: function() {/*
        var found = false
        for (index, fobj) in dao.enumerated() {
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
      javaCode: function() {/*
        boolean found = false;
        for (int index = 0; index < getDao().size(); index++) {
          FObject fobj = getDao().get(index);
          if (MLang.equals(fobj.get("id"), obj.get("id"))) {
            getDao().set(index, obj);
            found = true;
            break;
          }
        }
        if (!found) getDao().add(obj);
        sink.put(obj);
        notify_("put", obj);
      */},
    },
    {
      name: 'remove',
      swiftCode: function() {/*
        let index = dao.index(of: obj)
        if index != nil {
          dao.remove(at: index!)
          sink.remove(obj)
          notify_("remove", fObj: obj)
        }
      */},
      javaCode: function() {/*
        int index = getDao().indexOf(obj);
        if (index != -1) {
          getDao().remove(index);
          sink.remove(obj);
          notify_("remove", obj);
        }
      */},
    },
    {
      name: 'find',
      swiftCode: function() {/*
        for fobj in dao {
          if equals(fobj.get("id"), b: id as AnyObject?) {
            sink.put(fobj)
            return
          }
        }
        sink.error()
      */},
      javaCode: function() {/*
        for (FObject fobj : getDao()) {
          if (MLang.equals(fobj.get("id"), id)) {
            sink.put(fobj);
            return;
          }
        }
        sink.error();
      */},
    },
  ],
});
