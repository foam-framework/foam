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
  name: 'ComponentNameBuilder',
  package: 'foam.ui.polymer.gen',
  extends: 'foam.ui.polymer.gen.ComponentBuilderBase',

  imports: [
    'componentDAO as dao',
    'parser',
    'filterNodes',
    'getNodeAttribute'
  ],

  properties: [
    {
      type: 'StringArray',
      name: 'provides',
      factory: function() {
        return ['tagName', 'name', 'extends'];
      }
    },
    {
      type: 'StringArray',
      name: 'listensTo',
      factory: function() {
        return ['source'];
      }
    }
  ],

  methods: [
    {
      name: 'init',
      code: function() {
        this.run();
        return this.SUPER();
      }
    },
    {
      name: 'run',
      code: function() {
        var node = this.filterNodes(
            this.parser.parseString(this.comp.source),
            function(node) {
              return node.nodeName === 'polymer-element';
            })[0];
        if ( ! node ) return;
        var tagName = this.getNodeAttribute(node, 'name');
        if ( ! tagName ) return;
        var extendsTagName = this.getNodeAttribute(node, 'extends');
        this.comp.tagName = tagName;
        this.comp.name = this.getComponentName(tagName);
        if ( extendsTagName )
          this.comp.extends = this.getComponentName(extendsTagName);
        this.dao.put(this.comp);
      }
    },
    {
      name: 'getComponentName',
      code: function(tagName) {
        var name = tagName.charAt(0).toUpperCase() + tagName.slice(1);
        while ( name.indexOf('-') >= 0 ) {
          name = name.slice(0, name.indexOf('-')) +
              name.charAt(name.indexOf('-') + 1).toUpperCase() +
              name.slice(name.indexOf('-') + 2);
        }
        return name;
      }
    }
  ]
});
