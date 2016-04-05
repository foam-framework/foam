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
