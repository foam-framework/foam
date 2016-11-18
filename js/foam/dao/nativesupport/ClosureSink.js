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
  name: 'ClosureSink',
  extends: 'foam.dao.nativesupport.Sink',

  properties: [
    {
      model_: 'FunctionProperty',
      name: 'putFn',
    },
    {
      model_: 'FunctionProperty',
      name: 'removeFn',
    },
    {
      model_: 'FunctionProperty',
      name: 'errorFn',
    },
    {
      model_: 'FunctionProperty',
      name: 'eofFn',
    },
    {
      model_: 'FunctionProperty',
      name: 'resetFn',
    },
  ],
  methods: [
    {
      name: 'put',
      swiftCode: 'putFn.call(obj)',
      javaCode: 'getPutFn().call(obj);',
    },
    {
      name: 'remove',
      swiftCode: 'removeFn.call(obj)',
      javaCode: 'getRemoveFn().call(obj);',
    },
    {
      name: 'reset',
      swiftCode: 'resetFn.call()',
      javaCode: 'getResetFn().call();',
    },
    {
      name: 'eof',
      swiftCode: 'eofFn.call()',
      javaCode: 'getEofFn().call();',
    },
    {
      name: 'error',
      swiftCode: 'errorFn.call()',
      swiftCode: 'getErrorFn().call();',
    },
  ],
});
