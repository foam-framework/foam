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
  package: 'foam.documentation.markdown',
  name: 'QueryDocs',
  requires: [
    'foam.core.dao.OrDAO',
    'node.dao.ModelFileDAO',
  ],

  properties: [
    {
      name: 'models',
      required: true,
      adapt: function(old, nu) {
        return typeof nu === 'string' ? nu.split(',') : nu;
      }
    },
    {
      type: 'StringArray',
      name: 'extraClassPaths',
      help: 'List of extra .js hierarchies to load models from.  Paths will be checked in the order given, finally falling back to the main FOAM js/ hierarchy.',
      adapt: function(_, s) { if ( typeof s === 'string' ) return s.split(','); return s; }
    },
    {
      name: 'outputFile',
      required: true
    },
    {
      name: 'fs',
      factory: function() {
        return require('fs');
      }
    },
  ],

  methods: [
    function execute() {
      if (!this.outputFile) {
        console.error('outputFile parameter is required.');
        process.exit(1);
      }

      for ( var i = 0; i < this.extraClassPaths.length ; i++ ) {
        this.X.ModelDAO = this.OrDAO.create({
          delegate: this.ModelFileDAO.create({
            classpath: this.extraClassPaths[i]
          }),
          primary: this.X.ModelDAO
        });
      }

      apar.apply(null, this.models.map(arequire))(function() {
        var output = [];
        for (var i = 0; i < arguments.length; i++) {
          output.push(this.toMarkdown(undefined, arguments[i]));
        }
        this.fs.writeFileSync(this.outputFile, output.join('\n'));
      }.bind(this));
    },
  ],

  templates: [
    function toMarkdown(out, model) {/*
## <%= model.name %>

Name | Aliases
--- | ---
<% for (var i = 0; i < model.properties.length; i++) {
  var prop = model.properties[i];
  var extras = [];
  if (prop.shortName) extras.push(prop.shortName);
  if (prop.aliases && prop.aliases.length) extras.push.apply(extras, prop.aliases);
  %>**<%= prop.name %>** |<%= extras.length ? ' ' + extras.join(', ') : '' %>
<% } %>
*/},
  ]
});
