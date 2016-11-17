CLASS({
  name: 'TestModel',
  package: 'tests',
  requires: [
    'AbstractDAO',
    'FilteredDAO_',
    'foam.dao.nativesupport.ArraySink',
    'foam.dao.nativesupport.SwiftArrayDAO',
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
          javaType: 'String []',
        },
      ],
      isStatic: true,
      javaCode: function() {/*
        AbstractDAO dao = new SwiftArrayDAO();
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
        },
      ],
      isStatic: true,
      javaCode: function() {/*
        if (!value) {
          System.out.println(errMsg);
          Thread.currentThread().dumpStack();
        }
      */},
    },
  ],
});
