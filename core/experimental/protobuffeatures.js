/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
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

(function() {
  var features = [
    ['FObject', 'Method', function writeActions(other, out) {
      for ( var i = 0, property ; property = this.model_.properties[i] ; i++ ) {
        if ( property.actionFactory ) {
          var actions = property.actionFactory(this, property.f(this), property.f(other));
          for (var j = 0; j < actions.length; j++)
            out(actions[j]);
        }
      }
    }],
    ['FObject', 'Method', function toProtobuf() {
      var out = ProtoWriter.create();
      this.outProtobuf(out);
      return out.value;
    }],
    ['FObject', 'Method', function outProtobuf(out) {
      for ( var i = 0; i < this.model_.properties.length; i++ ) {
        var prop = this.model_.properties[i];
        if ( Number.isFinite(prop.prototag) )
          prop.outProtobuf(this, out);
      }
    }],
    ['Model', 'Property', {
      name: 'protoparser',
      label: 'ProtoParser',
      type: 'Grammar',
      hidden: true,
      transient: true,
      // TODO: this will be regenerated for each use, fix
      defaultValueFn: function() {
        var parser = {
          __proto__: BinaryProtoGrammar,

          START: sym('model'),

          model: []
        };
        this.features.forEach(function(f) {
          if ( ! Property.isInstance(f) )
            return;

          var prop = f;

          if (!prop.prototag) return;
          var p;
          var type = ArrayProperty.isInstance(prop) ? prop.subType : prop.type;
          switch(type) {
          case 'uint32':
          case 'int32':
            p = protouint32(prop.prototag);
            break;
          case 'uint64':
          case 'int64':
          case 'fixed64':
            p = protovarintstring(prop.prototag);
            break;
          case 'boolean':
          case 'bool':
            p = protobool(prop.prototag);
            break;
          case 'string':
            p = protostring(prop.prototag);
            break;
          case 'bytes':
            p = protobytes(prop.prototag);
            break;
          default:
            var model = GLOBAL[type];

            if (!model) throw "Could not find model for " + type;

            // HUGE HACK UNTIL ENUMS ARE BETTER IMPLEMENTED
            if (model.type == 'Enum') {
              p = protouint32(prop.prototag);
              break;
            }
            p = protomessage(prop.prototag, model.protoparser.export('START'));
          }

          parser[prop.name] = p;
          (function(prop) {
            parser.addAction(prop.name, function(a) {
              return [prop, a[1]];
            });
          })(prop);
          parser.model.push(sym(prop.name));
        });

        parser.model.push(sym('unknown field'));
        parser.model = repeat(alt.apply(undefined, parser.model));
        var self = this;
        parser.addAction('model', function(a) {
          var createArgs = {};
          for (var i = 0, field; field = a[i]; i++) {
            if (!field[0] || !Property.isInstance(field[0])) continue;
            if (ArrayProperty.isInstance(field[0]))
              createArgs[field[0].name] = (createArgs[field[0].name] || []).concat(field[1]);
            else
              createArgs[field[0].name] = field[1];
          }
          return self.create(createArgs);
        });

        this.instance_.protoparser = parser;

        return parser;
      }
    }]
  ];

  build(window, features);
})();
