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
  name: 'AndroidStringSource',
  requires: [
    'foam.i18n.TranslationFormatStringParser',
  ],

  properties: [
    {
      name: 'parser',
      factory: function() {
        return this.TranslationFormatStringParser.create({
          stringSymbol: 's',
        });
      },
    },
    'models',
    'prependModelName',
  ],

  methods: [
    function generate() {
      return this.stringSource.call(this).trim();
    },
    function escapeContents(str) {
      return XMLUtil.escape(str)
          .replace(/'/, '\\\'')
          .replace(/"/, '\\\"');
    },
    function getOutputArray() {
      var output = [];
      var self = this;
      self.models.forEach(function(m) {
        for ( var i = 0, message; message = m.messages[i]; i++) {
          if (message.labels && message.labels.indexOf('java') == -1) {
            continue;
          }
          self.parser.value = message.value;
          self.parser.translationHint = message.translationHint;

          var name = XMLUtil.escapeAttr(message.name);
          if (self.prependModelName) { name = m.name + '_' + name; }
          var translationHint = XMLUtil.escapeAttr(
              self.parser.parsedTranslationHint);
          var value = self.escapeContents(self.parser.parsedValue);
          output.push([name, translationHint, value]);
        }
        for ( var i = 0, property; property = m.properties[i]; i++) {
          if (property.label) {
            self.parser.value = property.label;
            if (!property.translationHint) { continue; }
            self.parser.translationHint = property.translationHint;

            var name = XMLUtil.escapeAttr(property.name) + "_label";
            if (self.prependModelName) { name = m.name + '_' + name; }
            var translationHint = XMLUtil.escapeAttr(
                self.parser.parsedTranslationHint);
            var value = self.escapeContents(self.parser.parsedValue);
            output.push([name, translationHint, value]);
          }
        }
      });
      return output;
    },
  ],

  templates: [
    function stringSource(_) {/*<%
%><?xml version="1.0" encoding="utf-8"?>
<resources>
<% this.getOutputArray().forEach(function(o) { %>
  <string name="<%= o[0] %>" description="<%= o[1] %>">
    <%= o[2] %>
  </string>
<% }); %>
</resources>*/},
  ]
});
