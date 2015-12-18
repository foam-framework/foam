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
  name: 'View',
  extends: 'foam.u2.Element',

  imports: [ 'controllerMode' ],

  properties: [
    'data',
    {
      name: 'visibility',
      choices: [ 'rw', 'final', 'disabled', 'ro', 'hidden' ],
      postSet: function(_, visibility) {
        this.updateMode_(this.mode);
      },
      attribute: true,
      defaultValue: 'rw'
    },
    {
      name: 'mode',
      choices: [ 'rw', 'disabled', 'ro', 'hidden' ],
      postSet: function(_, mode) { this.updateMode_(mode); },
      defaultValueFn: function() {
        if ( this.visibility === 'ro' ) return 'ro';
        if ( this.visibility === 'final' && 'create' !== this.controllerMode ) return 'ro';
        return 'view' === this.controllerMode ? 'ro' : 'rw';
      },
      attribute: true
    }
  ],

  methods: [
    function init() {
      this.SUPER();
      this.updateMode_(this.mode);
    },
    function updateMode_() {
      // Template method, to be implemented in sub-models
    },
    function fromProperty(p) {
      this.visibility = p.visibility;
    }
  ]
});
