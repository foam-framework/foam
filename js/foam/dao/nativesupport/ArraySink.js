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
  name: 'ArraySink',
  extends: 'foam.dao.nativesupport.Sink',

  properties: [
    {
      name: 'array',
      type: 'Array',
    },
  ],

  methods: [
    {
      name: 'put',
      swiftCode: 'array.append(obj)',
      javaCode: 'getArray().add(obj);',
    },
    {
      name: 'remove',
      swiftCode: function() {/*
        let index = array.firstIndex(of: obj)
        if index != nil {
          _ = array.remove(at: index!)
        }
      */},
      javaCode: function() {/*
        int index = getArray().indexOf(obj);
        if (index != -1) {
          getArray().remove(index);
        }
      */},
    },
    {
      name: 'reset',
      swiftCode: 'array.removeAll()',
      javaCode: 'getArray().clear();',
    },
  ],
});
