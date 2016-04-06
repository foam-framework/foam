CLASS({
  package: 'foam.dao.swift',
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
      swiftReturnType: 'SwiftArrayDAO',
      swiftCode: function() {/*
        var data = NSKeyedUnarchiver.unarchiveObjectWithFile(path) as? [FObject]
        if data == nil { data = [] }
        return SwiftArrayDAO(args: ["dao": data!])
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
              self.notify_("error")
            }
            return nil
          }),
          "errorFn": FoamFunction(fn: { (args) -> AnyObject? in
            sink.error()
            self.notify_("error")
            return nil
          })
        ])
        dao.put(obj, sink: closureSink)
      */},
    },
    {
      name: 'remove',
      swiftCode: function() {/*
        let dao = getArrayDao()
        let closureSink = ClosureSink(args: [
          "putFn": FoamFunction(fn: { (args) -> AnyObject? in
            if NSKeyedArchiver.archiveRootObject(dao.dao, toFile: self.path) {
              sink.put(obj)
              self.notify_("remove", fObj: obj)
            } else {
              sink.error()
              self.notify_("error")
            }
            return nil
          }),
          "errorFn": FoamFunction(fn: { (args) -> AnyObject? in
            sink.error()
            self.notify_("error")
            return nil
          })
        ])
        dao.remove(obj, sink: closureSink)
      */},
    },
  ],
});
