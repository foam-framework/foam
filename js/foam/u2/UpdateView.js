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
  package: 'foam.u2',
  name: 'UpdateView',
  extends: 'foam.u2.View',

  imports: [
    'dao',
  ],

  properties: [
    {
      name: 'delegate',
      required: true,
      documentation: 'An inner element, which receives data. Whenever that ' +
          'data changes, this view will save it to the DAO.',
    },
    {
      name: 'data',
      postSet: function(old, nu) {
        if (old === nu) return;
        if (old) old.removeListener(this.onUpdate);
        if (nu) nu.addListener(this.onUpdate);
        if (this.delegate) this.delegate.data = nu;
      },
    },
  ],

  listeners: [
    {
      name: 'onUpdate',
      isFramed: true,
      code: function() {
        this.commit_();
      }
    },
  ],

  methods: [
    function commit_() {
      this.dao.put(obj);
    },
    function initE() {
      this.add(this.delegate);
    },
  ]
});
