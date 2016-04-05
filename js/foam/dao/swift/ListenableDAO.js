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
