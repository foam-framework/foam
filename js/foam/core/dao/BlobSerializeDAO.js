/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
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
  "package": "foam.core.dao",
  "name": "BlobSerializeDAO",

  "extends": "foam.dao.ProxyDAO",
  "requires": [
    "foam.util.Base64Encoder",
    "foam.util.Base64Decoder"
  ],
  "properties": [
    {
      type: 'Array',
      "name": "properties",
      "subType": "Property"
    }
  ],
  "methods": [
    {
      model_: "Method",
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
      }
    },
    {
      model_: "Method",
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
      }
    },
    {
      model_: "Method",
      "name": "put",
      "code": function (o, sink) {
        var self = this;
        this.serialize(function(obj) {
          self.delegate.put(obj, sink);
        }, o);
      }
    },
    {
      model_: "Method",
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
      }
    },
    {
      model_: "Method",
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
      }
    }
  ]
});
