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
  name: 'PolymerPrototypeBuilder',
  package: 'foam.ui.polymer.gen',

  requires: [
    'foam.ui.polymer.gen.Component',
    'foam.ui.polymer.gen.FunctionWrapper',
    'foam.ui.polymer.gen.PolymerPrototype'
  ],

  imports: [
    'prototypeDAO as dao'
  ],

  properties: [
    {
      type: 'Function',
      name: 'polymerFnImpl',
      factory: function() {
        return function(name, proto) {
          // Follow polymer's name+proto parameter matching.
          if (typeof name !== 'string') {
            var script = proto || document._currentScript;
            proto = name;
            name = (script &&
                script.parentNode &&
                script.parentNode.getAttribute) ?
                script.parentNode.getAttribute('name') : '';
          }
          // Store name+proto in polymers queue for processing by
          // ModelGenerator.
          this.dao.put(this.PolymerPrototype.create({
            tagName: name,
            proto: proto
          }));
        }.bind(this);
      },
      hidden: true
    },
    {
      type: 'foam.ui.polymer.gen.FunctionWrapper',
      name: 'polymerFn',
      factory: function() {
        var fn = this.FunctionWrapper.create({
          name: 'Polymer'
        });
        fn.object[fn.name] = this.polymerFnImpl;
        return fn;
      },
      hidden: true
    }
  ]
});
