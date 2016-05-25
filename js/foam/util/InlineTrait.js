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

      var mergeTraits = function(propName) {
        var properties = model[propName];
        for ( var i = 0; i < model.traits.length; i++ ) {
          var trait = this.X.lookup(model.traits[i]);
          for ( var j = 0; j < trait[propName].length; j++ ) {
            var traitProp = trait[propName][j];

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
        }
        model[propName] = properties;
      }.bind(this);

      mergeTraits('properties');
      mergeTraits('methods');
      mergeTraits('constants');
      mergeTraits('messages');

      if (model.javaClassImports) {
        var javaClassImports = model.javaClassImports;
        for ( var i = 0; i < model.traits.length; i++ ) {
          var trait = this.X.lookup(model.traits[i]);
          javaClassImports = javaClassImports.concat(trait.javaClassImports);
        }
        model.javaClassImports = javaClassImports.filter(function(v, i) {
          // Remove duplicates.
          return javaClassImports.indexOf(v) == i;
        });
      }

      model.traits = [];

      return model;
    }
  ]
});
