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
  name: 'GenSwift',
  extends: 'foam.tools.GenCode',
  requires: [
    'foam.util.swift.SwiftSource',
  ],
  properties: [
    {
      name: 'template',
      factory: function() { return this.SwiftSource.create(); },
    },
    {
      name: 'fileExtension',
      defaultValue: 'swift',
    },
    {
      name: 'requiredDeps',
      defaultValue: [
        // MLangs required by MLang.swift.
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
    function getExtraRequires(m) {
      var requires = [];
      if (m.model_.id == 'foam.swift.ui.DetailView') {
        requires = requires.concat([
          'foam.swift.ui.FoamEnumUILabel',
          'foam.swift.ui.FoamFloatUITextField',
          'foam.swift.ui.FoamIntUITextField',
          'foam.swift.ui.FoamUILabel',
          'foam.swift.ui.FoamUISwitch',
          'foam.swift.ui.FoamUITextField',
        ]);
      }

      if (m.id == 'AbstractDAO') {
        // Required for DAO support and not required by AbstractDAO.
        requires = requires.concat([
          'FilteredDAO_',
          'foam.dao.nativesupport.ArraySink',
          'foam.dao.nativesupport.ClosureSink',
          'foam.dao.nativesupport.DAOQueryOptions',
          'foam.dao.nativesupport.PredicatedSink',
          'foam.dao.nativesupport.RelaySink',
        ]);
      }
      return requires;
    },
  ],
});
