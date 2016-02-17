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
  name: 'JSONProtoTrait',

  documentation: 'Add this to a model to make it able to serialize itself to ' +
      'and from JSON-formatted protocol buffers. (That is, the ' +
      '<tt>{ "field": value }</tt> style of JSON protos. Not the ' +
      '<tt>[,,value1,,,,value2,,]</tt> JSPB style of JSON protos.',

  methods: [
    function fromProto(obj) {
      // Iterate over the properties on this model, looking for the ones that
      // define fromProto.
      var props = this.model_.getRuntimeProperties();
      for (var i = 0; i < props.length; i++) {
        var p = props[i];
        if (p.fromProto) {
          var v = p.fromProto(obj);
          if (typeof v !== 'undefined') {
            this[p.name] = v;
          }
        }
      }
    },

    function toProto() {
      var obj = {};
      var props = this.model_.getRuntimeProperties();
      for (var i = 0; i < props.length; i++) {
        var p = props[i];
        if (p.toProto && this.hasOwnProperty(p.name)) {
          p.toProto(obj, this[p.name]);
        }
      }
      return obj;
    },
  ]
});
