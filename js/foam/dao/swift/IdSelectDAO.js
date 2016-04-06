CLASS({
  package: 'foam.dao.swift',
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
            numSelected++
            let selectedObj = args[0] as! FObject
            let id = selectedObj.get("id") as! String
            self.find(id, sink: ClosureSink(args: [
              "putFn": FoamFunction(fn: { (args) -> AnyObject? in
                let foundObj = args[0] as! FObject
                numFound++
                decoratedSink.put(foundObj)
                maybeFinish()
                return nil
              }),
              "errorFn": FoamFunction(fn: { (args) -> AnyObject? in
                numFound++
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
