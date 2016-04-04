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
  package: 'foam.util',
  name: 'InlineTrait',
  documentation: 'Utility class to inline traits into a model in preparation for generators that don\'t handle traits properly.',
  methods: [
    function inlineTraits(model) {
      model = model.deepClone();

      var properties = model.properties;
      var methods = model.methods;
      for ( var i = 0; i < model.traits.length; i++ ) {
        var trait = this.X.lookup(model.traits[i]);

        for ( var j = 0; j < trait.properties.length; j++ ) {
          var traitProp = trait.properties[j];

          for ( var k = 0; k < properties.length; k++ ) {
            var prop = properties[k];
            if ( prop.name === traitProp.name ) {
              properties[k] = traitProp.deepClone().copyFrom(prop);
              break;
            }
          }
          if ( k === properties.length ) {
            properties.push(traitProp);
          }
        }
        for ( var j = 0; j < trait.methods.length; j++ ) {
          var traitMethod = trait.methods[j];
          for ( var k = 0; k < methods.length; k++ ) {
            var method = methods[k];
            if ( method.name === traitMethod.name ) {
              methods[k] = traitMethod.deepClone().copyFrom(method);
              break;
            }
          }
          if ( k === methods.length ) {
            methods.push(traitMethod);
          }
        }
      }
      model.methods = methods;
      model.properties = properties;
      model.traits = [];

      return model;
    }
  ]
});
