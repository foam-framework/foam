/**
 * @license
 * Copyright 2017 Google Inc. All Rights Reserved.
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
  package: 'foam.tools',
  name: 'AndroidConstantSource',

  properties: [
    'models',
    'prependModelName',
  ],

  methods: [
    function generate() {
      return this.stringSource.call(this).trim();
    },
    function getOutputArray() {
      var output = [];
      var self = this;
      self.models.forEach(function(m) {
        m.constants.forEach(function(c) {
          if (!c.units) return;
          var name = c.name;
          if (self.prependModelName) name = m.name + '_' + name;
          output.push([name, c.javaValue, c.units]);
        });
      });
      return output;
    },
  ],

  templates: [
    function stringSource(_, util) {/*
<?xml version="1.0" encoding="utf-8"?>
<resources>
<% this.getOutputArray().forEach(function(o) { %>
  <dimen name="<%= o[0] %>"><%= o[1] %><%= o[2] %></dimen>
<% }); %>
</resources>
    */},
  ]
});
