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
  name: 'ComponentAttributesBuilder',
  package: 'foam.ui.polymer.gen',
  extends: 'foam.ui.polymer.gen.ComponentBuilderBase',

  requires: [
    'foam.ui.polymer.gen.ComponentProperty'
  ],

  imports: [
    'propertyDAO as dao',
    'parser',
    'filterNodes',
    'getNodeAttribute'
  ],

  constants: [
    {
      name: 'NOT_CUSTOM_ATTRIBUTES',
      type: 'Array[String]',
      value: ['name', 'extends', 'attributes', 'noscript', 'constructor']
    }
  ],

  properties: [
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
        this.getAttributesAttribute(node);
        this.getCustomAttributes(node);
      }
    },
    {
      name: 'getAttributesAttribute',
      code: function(node) {
        var attrsStr = this.getNodeAttribute(node, 'attributes');
        if ( ! attrsStr ) return;
        var attrs = attrsStr.replace(/\s+/g, ' ').trim().split(' ');
        attrs.forEach(function(attrName) {
          if ( ! attrName ) return;
          this.dao.put(this.ComponentProperty.create({
            url: this.comp.url,
            name: attrName
          }));
        }.bind(this));
      }
    },
    {
      name: 'getCustomAttributes',
      code: function(node) {
        node.attributes.filter(function(attr) {
          return ! this.NOT_CUSTOM_ATTRIBUTES.some(
              function(attr, notCustomAttrName) {
                return notCustomAttrName === attr.name;
              }.bind(this, attr));
        }.bind(this)).forEach(function(attr) {
          this.dao.put(this.ComponentProperty.create({
            url: this.comp.url,
            name: attr.name,
            propertyModel: 'StringProperty',
            defaultValue: attr.value
          }));
        }.bind(this));
      }
    }
  ]
});
