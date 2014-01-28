/**
 * @license
 * Copyright 2013 Google Inc. All Rights Reserved.
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
Model.properties = Model.properties.concat(
    [
      {
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
          for (var i = 0, prop; prop = this.properties[i]; i++) {
            if (!prop.prototag) continue;
            var p;
            var type = ArrayProperty.isInstance(prop) ? prop.subType : prop.type;
            switch(type) {
              case 'uint32':
              case 'int32':
              p = protouint32(prop.prototag);
              break;
              case 'uint64':
              case 'int64':
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
          }
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
      }
    ]);

// When we first bootstrap using Model = Model.create(Model), the Method model
// is not defined.  As a result in the preSet of the 'methods' property,
// the value of 'methods' is not copied over from the original Model definition
// into the bootstrapped one.  So we need to re-set the methods property here
// before re-creating Model.
Model.methods = {
    hashCode:       ModelProto.hashCode,
    buildPrototype: ModelProto.buildPrototype,
    getPrototype:   ModelProto.getPrototype,
    isSubModel:     ModelProto.isSubModel,
    isInstance:     ModelProto.isInstance
};

// We use getPrototype() because we need to re-create the Model prototype now
// that it has been mutated.  Normally Model.create() is for reading model
// definitions and creating new models (like EMail or Issue).  But for
// re-creating Model we need to rebuild it's prototype.
Model = Model.getPrototype().create(Model);
Model.model_ = Model;
Model.create = ModelProto.create;
