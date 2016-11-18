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
  name: 'DelayDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: function() {/*
    A DAO decorator that allows you to add a delay before a method is actually
    called.
  */},

  properties: [
    {
      name: 'putDelay',
      type: 'Int',
    },
  ],
  methods: [
    {
      name: 'put',
      swiftCode: function() {/*
        let dao = delegate
        Delay(Double(putDelay))({ _ in
          dao.put(obj, sink: sink)
        }, nil)
      */},
    },
  ],
});

