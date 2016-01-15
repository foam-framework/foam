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
  package: 'foam.node.dao',
  name: 'XMLFileDAO',
  extends: 'MDAO',

  properties: [
    {
      name: 'fs',
      factory: function() {
        return require('fs');
      }
    },
    {
      name:  'name',
      label: 'File Name',
      type: 'String',
      defaultValueFn: function() {
        return this.model.plural + '.xml';
      }
    }
  ],

  methods: {
    init: function() {
      this.SUPER();

      if ( this.fs.existsSync(this.name) ) {
        var content = this.fs.readFileSync(this.name, { encoding: 'utf-8' });
        var parsed = XMLUtil.parse(content);
        if (!parsed) {
          console.error('Failed to parse contents: ' + content);
        } else {
          parsed.select(this);
        }
      } else {
        console.warn('XMLFileDAO could not find file "' + this.name + '"');
      }

      this.addRawIndex({
        execute: function() {},
        bulkLoad: function() {},
        toString: function() { return "XMLFileDAO Update"; },
        plan: function() {
          return { cost: Number.MAX_VALUE };
        },
        put: this.updated,
        remove: this.updated
      });
    }
  },

  listeners: [
    {
      name: 'updated',
      isMerged: 100,
      code: function() {
        this.select()(function(a) {
          this.fs.writeFileSync(this.name, XMLUtil.stringify(a), { encoding: 'utf-8' });
        }.bind(this));
      }
    }
  ]
});
