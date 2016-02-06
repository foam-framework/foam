/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
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
  package: 'foam.net.proto',
  name: 'JSONProtoPropertyTrait',
  properties: [
    {
      name: 'protoField',
      documentation: 'Gives the protobuf field name corresponding to this ' +
          'property. If this property corresponds to a field buried in a ' +
          'nested proto, this can be an array of field names.',
      defaultValue: undefined,
      adapt: function(old, nu) {
        return typeof nu === 'object' ? nu : [nu];
      }
    },
    {
      name: 'protoModel',
      documentation: 'If this proto field contains a nested proto message, ' +
          'the <tt>protoModel</tt> is used as the model for that proto. For ' +
          'a repeated field, each element in the array becomes an instance ' +
          'of this model.',
    },
  ],

  methods: [
    function fromProto(obj) {
      if (this.protoField) {
        var o = obj;
        for (var i = 0; i < this.protoField.length; i++) {
          if (!o) break;
          o = o[this.protoField[i]];
        }

        if (o && this.protoModel) {
          var m = this.X.lookup(this.protoModel);
          if (m) {
            var f = (function(x) {
              if (m.getPrototype().fromProto) {
                var nu = m.create(null, this.Y);
                nu.fromProto(x);
                return nu;
              } else {
                return m.create(x, this.Y);
              }
            }).bind(this);

            return Array.isArray(o) ? o.map(f) : f(o);
          }
        }

        return o;
      } else {
        console.warn('fromProto on ' + this.name + ', which has no protoField defined.');
        return undefined;
      }
    },

    function toProto(obj, value) {
      if (this.protoField) {
        var o = obj;
        if (this.protoField.length > 1) {
          for (var i = 0; i < this.protoField.length - 1; i++) {
            if (typeof o[this.protoField[i]] !== 'object') {
              o[this.protoField[i]] = {};
            }
            o = o[this.protoField[i]];
          }
        }

        // Now o is the final object we want to put our value on.
        // If there's a protoModel defined, we'll have that model serialize
        // itself to JSON proto format.
        if (this.protoModel) {
          if (Array.isArray(value)) {
            value = value.map(function(x) { return x.toProto(); });
          } else {
            value = value.toProto();
          }
        }

        o[this.protoField[this.protoField.length - 1]] = value;
      } else {
        console.warn('toProto called on ' + this.name + ' which has no protoField defined.');
      }
    },
  ]
});
