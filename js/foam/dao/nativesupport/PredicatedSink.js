/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
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
  package: 'foam.dao.nativesupport',
  name: 'PredicatedSink',
  extends: 'foam.dao.nativesupport.ProxySink',

  properties: [
    {
      name: 'expr',
      swiftType: 'ExprProtocol',
      javaType: 'foam.core2.ExprInterface',
    },
  ],

  methods: [
    {
      name: 'put',
      swiftCode: function() {/*
        let result = expr.f(obj) as! Bool
        if result {
          delegate?.put(obj)
        }
      */},
      javaCode: function() {/*
        Boolean result = (Boolean) getExpr().f(obj);
        if (result.booleanValue()) {
          getDelegate().put(obj);
        }
      */},
    },
    {
      name: 'remove',
      swiftCode: function() {/*
        let result = expr.f(obj) as! Bool
        if result {
          delegate?.remove(obj)
        }
      */},
      javaCode: function() {/*
        Boolean result = (Boolean) getExpr().f(obj);
        if (result.booleanValue()) {
          getDelegate().remove(obj);
        }
      */},
    },
  ],
});
