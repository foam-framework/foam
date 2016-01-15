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
  name: 'ComponentBuilder',
  package: 'foam.ui.polymer.gen',
  extends: 'foam.ui.polymer.gen.ComponentBuilderBase',

  requires: [
    'XHR',
    'foam.ui.polymer.gen.Component',
    'foam.ui.polymer.gen.ComponentNameBuilder',
    'foam.ui.polymer.gen.ComponentAttributesBuilder',
    'foam.ui.polymer.gen.ComponentDependencyBuilder',
    'foam.ui.polymer.gen.PolymerPrototypeImporter'
  ],

  imports: [
    'componentDAO as dao'
  ],


  properties: [
    {
      type: 'StringArray',
      name: 'provides',
      factory: function() {
        return ['source'];
      }
    },
    {
      name: 'nameBuilder',
      type: 'foam.ui.polymer.gen.ComponentNameBuilder',
      defaultValue: null
    },
    {
      name: 'attrsBuilder',
      type: 'foam.ui.polymer.gen.ComponentAttributesBuilder',
      defaultValue: null
    },
    {
      name: 'depBuilder',
      type: 'foam.ui.polymer.gen.ComponentDependencyBuilder',
      defaultValue: null
    },
    {
      name: 'polyImporter',
      type: 'foam.ui.polymer.gen.PolymerPrototypeImporter',
      defaultValue: null
    }
  ],

  methods: [
    {
      name: 'init',
      code: function() {
        var ret = this.SUPER();
        this.run();
        return ret;
      }
    },
    {
      name: 'run',
      code: function() {
        var xhr = this.XHR.create();
        var url = this.comp.url;
        var dir = url.slice(0, url.lastIndexOf('/') + 1);
        xhr.asend(function(textContent) {
          this.comp.source = textContent;
          this.dao.put(this.comp);
          this.nameBuilder = this.ComponentNameBuilder.create();
          this.attrsBuilder = this.ComponentAttributesBuilder.create();
          this.depBuilder = this.ComponentDependencyBuilder.create();
          this.polyImporter = this.PolymerPrototypeImporter.create();
        }.bind(this), url);
      }
    }
  ]
});
