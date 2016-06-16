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
  package: 'foam.dao.swift',
  name: 'RelaySink',
  extends: 'foam.dao.swift.Sink',

  properties: [
    {
      name: 'relay',
      swiftType: 'AbstractDAO?',
    },
  ],
  methods: [
    {
      name: 'put',
      swiftCode: 'relay?.notify_("put", fObj: obj)',
    },
    {
      name: 'remove',
      swiftCode: 'relay?.notify_("remove", fObj: obj)',
    },
    {
      name: 'eof',
      swiftCode: 'relay?.notify_("eof", fObj: nil)',
    },
  ],
});
