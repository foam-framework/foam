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
  name: 'ProxySink',
  extends: 'foam.dao.nativesupport.Sink',

  properties: [
    {
      name: 'delegate',
      swiftType: 'Sink?',
      javaType: 'foam.dao.nativesupport.Sink',
    },
  ],
  methods: [
    {
      name: 'put',
      swiftCode: 'delegate?.put(obj)',
      javaCode: 'if (getDelegate() != null) getDelegate().put(obj);',
    },
    {
      name: 'remove',
      swiftCode: 'delegate?.remove(obj)',
      javaCode: 'if (getDelegate() != null) getDelegate().remove(obj);',
    },
    {
      name: 'reset',
      swiftCode: 'delegate?.reset()',
      javaCode: 'if (getDelegate() != null) getDelegate().reset();',
    },
    {
      name: 'eof',
      swiftCode: 'delegate?.eof()',
      javaCode: 'if (getDelegate() != null) getDelegate().eof();',
    },
    {
      name: 'error',
      swiftCode: 'delegate?.error()',
      javaCode: 'if (getDelegate() != null) getDelegate().error();',
    },
  ],
});
