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
  name: 'TestModel',
  package: 'tests',
  requires: [
    'AbstractDAO',
    'FilteredDAO_',
    'foam.dao.nativesupport.ArraySink',
    'foam.dao.nativesupport.ArrayDAO',
  ],
  properties: [
    {
      type: 'String',
      name: 'test',
    },
  ],
  methods: [
    {
      name: 'testMethod',
      args: [
        {
          name: 'testArg',
          javaType: 'String', 
          javaDefaultValue: '"Hello world"',
        },
        {
          name: 'testArg2',
          javaType: 'String', 
        },
      ],
      isStatic: true,
      javaCode: function() {/*
        System.out.println(testArg);
      */},
    },
    {
      name: 'main',
      args: [
        {
          name: 'args',
          swiftType: '[AnyObject] = []',
          javaType: 'String []',
        },
      ],
      isStatic: true,
      swiftCode: function() {/*
        testListeners()
        testPipe()
      */},
      javaCode: function() {/*
        testListeners();
        testPipe();
      */},
    },
    {
      name: 'testListeners',
      isStatic: true,
      swiftCode: function() {/*
        let dao = ArrayDAO()
        var sink: ArraySink! = nil

        let listener = ArraySink()
        dao.listen(listener)

        let predicatedListener = ArraySink()
        dao.`where`(EQ(TestModel.TestModel_TEST, arg2: "MyID2" as AnyObject?)).listen(predicatedListener)

        let obj1 = TestModel()
        _ = obj1.set("id", value: "MyID" as AnyObject?)
        dao.put(obj1)
        sink = ArraySink()
        _ = dao.select(sink)
        assertTrue(sink.array.count == 1)
        assertTrue(listener.array.count == 1)
        assertTrue(predicatedListener.array.count == 0)

        let obj2 = TestModel()
        _ = obj2.set("id", value: "MyID2" as AnyObject?)
        dao.put(obj2)
        sink = ArraySink()
        _ = dao.select(sink)
        assertTrue(sink.array.count == 2)
        assertTrue(listener.array.count == 2)
        assertTrue(predicatedListener.array.count == 1)

        sink = ArraySink()
        _ = dao.`where`(EQ(TestModel.TestModel_TEST, arg2: "MyID2" as AnyObject?)).select(sink)
        assertTrue(sink.array.count == 1)

        dao.remove(obj1)
        sink = ArraySink()
        _ = dao.select(sink)
        assertTrue(sink.array.count == 1)
        assertTrue(listener.array.count == 1)
        assertTrue(predicatedListener.array.count == 1)

        dao.remove(obj2)
        sink = ArraySink()
        _ = dao.select(sink)
        assertTrue(sink.array.count == 0)
        assertTrue(listener.array.count == 0)
        assertTrue(predicatedListener.array.count == 0)

        NSLog("Hooray! We're done.")
      */},
      javaCode: function() {/*
        AbstractDAO dao = new ArrayDAO();
        ArraySink sink;

        ArraySink listener = new ArraySink();
        dao.listen(listener);

        ArraySink predicatedListener = new ArraySink();
        dao.where(MLang.EQ(TestModel.TestModel_TEST(), "MyID2")).listen(predicatedListener);

        TestModel obj1 = new TestModel();
        obj1.set("id", "MyID");
        dao.put(obj1);
        sink = new ArraySink();
        dao.select(sink);
        assertTrue(sink.getArray().size() == 1);
        assertTrue(listener.getArray().size() == 1);
        assertTrue(predicatedListener.getArray().size() == 0);

        TestModel obj2 = new TestModel();
        obj2.set("id", "MyID2");
        dao.put(obj2);
        sink = new ArraySink();
        dao.select(sink);
        assertTrue(sink.getArray().size() == 2);
        assertTrue(listener.getArray().size() == 2);
        assertTrue(predicatedListener.getArray().size() == 1);

        sink = new ArraySink();
        dao.where(MLang.EQ(TestModel.TestModel_TEST(), "MyID2")).select(sink);
        assertTrue(sink.getArray().size() == 1);

        dao.remove(obj1);
        sink = new ArraySink();
        dao.select(sink);
        assertTrue(sink.getArray().size() == 1);
        assertTrue(listener.getArray().size() == 1);
        assertTrue(predicatedListener.getArray().size() == 1);

        dao.remove(obj2);
        sink = new ArraySink();
        dao.select(sink);
        assertTrue(sink.getArray().size() == 0);
        assertTrue(listener.getArray().size() == 0);
        assertTrue(predicatedListener.getArray().size() == 0);

        System.out.println("Hooray! We're done.");
      */},
    },
    {
      name: 'testPipe',
      isStatic: true,
      swiftCode: function() {/*
        let dao = ArrayDAO()

        let obj1 = TestModel()
        _ = obj1.set("id", value: "MyID" as AnyObject?)
        dao.put(obj1)

        let sink = ArraySink()
        dao.pipe(sink)

        assertTrue(sink.array.count == 1)

        let obj2 = TestModel()
        _ = obj2.set("id", value: "MyID2" as AnyObject?)
        dao.put(obj2)

        assertTrue(sink.array.count == 2)

        dao.remove(obj1)
        assertTrue(sink.array.count == 1)

        dao.unlisten(sink)
        dao.remove(obj2)
        assertTrue(sink.array.count == 1)

        NSLog("Hooray! We're done.")
      */},
      javaCode: function() {/*
        ArrayDAO dao = new ArrayDAO();

        TestModel obj1 = new TestModel();
        obj1.set("id", "MyID");
        dao.put(obj1);

        ArraySink sink = new ArraySink();
        dao.pipe(sink);

        assertTrue(sink.getArray().size() == 1);

        TestModel obj2 = new TestModel();
        obj2.set("id", "MyID2");
        dao.put(obj2);

        assertTrue(sink.getArray().size() == 2);

        dao.remove(obj1);
        assertTrue(sink.getArray().size() == 1);

        dao.unlisten(sink);
        dao.remove(obj2);
        assertTrue(sink.getArray().size() == 1);

        System.out.println("Hooray! We're done.");
      */},
    },
    {
      name: 'assertTrue',
      args: [
        {
          name: 'value',
          type: 'Boolean',
        },
        {
          name: 'errMsg',
          type: 'String',
          javaDefaultValue: '"Error"',
          swiftType: 'String = "Error"',
        },
      ],
      isStatic: true,
      javaCode: function() {/*
        if (!value) {
          System.out.println(errMsg);
          Thread.currentThread().dumpStack();
        }
      */},
      swiftCode: function() {/*
        assert(value, errMsg)
      */},
    },
  ],
});
