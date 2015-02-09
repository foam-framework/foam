CLASS({
   "model_": "Model",
   "id": "foam.core.dao.BlobSerializeDAO",
   "package": "foam.core.dao",
   "name": "BlobSerializeDAO",
   "extendsModel": "ProxyDAO",
   "requires": [
      "foam.util.Base64Encoder",
      "foam.util.Base64Decoder"
   ],
   "imports": [],
   "exports": [],
   "properties": [
      {
         "model_": "Property",
         "name": "daoListeners_",
         "hidden": true,
         "transient": true,
         "factory": function () { return []; }
      },
      {
         "model_": "Property",
         "name": "delegate",
         "type": "DAO",
         "mode": "read-only",
         "required": true,
         "hidden": true,
         "transient": true,
         "factory": function () { return NullDAO.create(); },
         "postSet": function (oldDAO, newDAO) {
        if ( this.daoListeners_.length ) {
          if ( oldDAO ) oldDAO.unlisten(this.relay());
          newDAO.listen(this.relay());
          // FutureDAOs will put via the future. In that case, don't put here.
          if ( ! FutureDAO.isInstance(oldDAO) ) this.notify_('put', []);
        }
      }
      },
      {
         "model_": "ModelProperty",
         "name": "model",
         "defaultValueFn": function () { return this.delegate.model; },
         "type": "Model"
      },
      {
         "model_": "ArrayProperty",
         "name": "properties",
         "subType": "Property"
      }
   ],
   "actions": [],
   "constants": [],
   "messages": [],
   "methods": [
      {
         "model_": "Method",
         "name": "serialize",
         "code": function (ret, obj) {
      obj = obj.clone();
      var afuncs = [];
      var self = this;
      for ( var i = 0, prop; prop = this.properties[i]; i++ ) {
        afuncs.push((function(prop) {
          return (function(ret) {
            if ( !obj[prop.name] ) {
              ret();
              return;
            }

            var reader = new FileReader();
            reader.onloadend = function() {
              var type = obj[prop.name].type;
              obj[prop.name] = 'data:' + type + ';base64,' + this.Base64Encoder.create().encode(new Uint8Array(reader.result));
              ret();
            }

            reader.readAsArrayBuffer(obj[prop.name]);
          });
        })(prop));
      }

      apar.apply(undefined, afuncs)(function() {
        ret(obj);
      });
    },
         "args": []
      },
      {
         "model_": "Method",
         "name": "deserialize",
         "code": function (obj) {
      for ( var i = 0, prop; prop = this.properties[i]; i++ ) {
        var value = prop.f(obj);
        if ( !value ) continue;
        var type = value.substring(value.indexOf(':') + 1,
                                   value.indexOf(';'));
        value = value.substring(value.indexOf(';base64') + 7);
        var decoder = this.Base64Decoder.create();
        decoder.put(value);
        decoder.eof();
        obj[prop.name] = new Blob(decoder.sink, { type: type });
      }
    },
         "args": []
      },
      {
         "model_": "Method",
         "name": "put",
         "code": function (o, sink) {
      var self = this;
      this.serialize(function(obj) {
        self.delegate.put(obj, sink);
      }, o);
    },
         "args": []
      },
      {
         "model_": "Method",
         "name": "select",
         "code": function (sink, options) {
      var self = this;
      var mysink = {
        __proto__: sink,
        put: function() {
          var args = Array.prototype.slice.call(arguments);
          self.deserialize(args[0]);
          sink.put.apply(sink, args);
        }
      };
      var args = Array.prototype.slice.call(arguments);
      args[0] = mysink;
      this.delegate.select.apply(this.delegate, args);
    },
         "args": []
      },
      {
         "model_": "Method",
         "name": "find",
         "code": function (q, sink) {
      var self = this;
      var mysink = {
        __proto__: sink,
        put: function() {
          var args = Array.prototype.slice.call(arguments);
          self.deserialize(args[0]);
          sink.put.apply(sink, args);
        }
      };
      this.delegate.find(q, mysink);
    },
         "args": []
      }
   ],
   "listeners": [],
   "templates": [],
   "models": [],
   "tests": [],
   "relationships": [],
   "issues": []
});
