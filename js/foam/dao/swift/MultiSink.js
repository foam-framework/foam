CLASS({
  package: 'foam.dao.swift',
  name: 'MultiSink',
  extends: 'foam.dao.swift.Sink',

  documentation: function() {/*
    A sink that takes an array of sinks as a property and will execute all of
    the sink functions (put, remove, eof, etc.) on all of the sinks in the
    array.
  */},

  properties: [
    {
      name: 'sinks',
      swiftType: '[Sink]',
      swiftFactory: 'return []',
    },
  ],

  methods: [
    {
      name: 'put',
      swiftCode: function() {/*
        for sink in sinks {
          sink.put(obj)
        }
      */},
    },
    {
      name: 'remove',
      swiftCode: function() {/*
        for sink in sinks {
          sink.remove(obj)
        }
      */},
    },
    {
      name: 'reset',
      swiftCode: function() {/*
        for sink in sinks {
          sink.reset()
        }
      */},
    },
    {
      name: 'eof',
      swiftCode: function() {/*
        for sink in sinks {
          sink.eof()
        }
      */},
    },
    {
      name: 'error',
      swiftCode: function() {/*
        for sink in sinks {
          sink.error()
        }
      */},
    },
  ],
});

