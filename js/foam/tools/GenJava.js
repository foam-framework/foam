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
  package: 'foam.tools',
  name: 'GenJava',
  extends: 'foam.tools.GenCode',
  requires: [
    'foam.util.JavaSource2',
  ],
  properties: [
    {
      name: 'template',
      factory: function() { return this.JavaSource2.create(); },
    },
    {
      name: 'fileNameProperty',
      defaultValue: 'javaClassName',
    },
    {
      name: 'fileExtension',
      defaultValue: 'java',
    },
    {
      name: 'requiredDeps',
      defaultValue: [
        'Model',
        'AndExpr',
        'BINARY',
        'ConstantExpr',
        'EqExpr',
        'Expr',
        'FalseExpr',
        'NARY',
        'TrueExpr',
        'UNARY',
      ],
    },
  ],
  methods: [
    function execute() {
      var self = this;
      this.genCode()(function(models) {
        if (!models) process.exit(1);
        self.fs.writeFileSync(
          self.outfolder + '/FoamModelMap.java',
          self.nameToModelMap.call(self, undefined, models, self));
      });
    },
  ],
  templates: [
    function nameToModelMap(_, models, util) {/*
package <%= util.template.defaultPackage %>;
import java.util.HashMap;
public class FoamModelMap {
  public static Model get(String modelId) {
    switch (modelId) {
<% models.filter(function(m) { return m.model_.name == 'Model'; }).forEach(function(m) { %>
      case "<%= m.package %><%= m.package ? '.' : ''%><%= m.name%>":
        return <%= m.package || util.template.defaultPackage  %>
            .<%= m.javaClassName %>
            .<%= m.javaClassName %>Model();
<% }) %>
      default:
        return null;
    }
  }
}
    */},
  ],
});
