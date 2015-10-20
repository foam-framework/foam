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
  extends: 'foam.u2.Element'

  exports: [ 'controllerMode' ],

  properties: [
    {
      name: 'visibility',
      choices: [ 'rw', 'final', 'disabled', 'ro', 'hidden' ],
      defaultValueFn: function() { this.prop ? this.prop.visibility : 'rw'; }
    },
    {
      name: 'displayMode',
      choices: [ 'rw', 'disabled', 'ro', 'hidden' ],
      defaultValueFn: function() {
        if ( this.visibility === 'ro' ) return 'ro';
        if ( this.visibility === 'final' && this.controllerMode !== 'create' ) return 'ro';
        return this.controllerMode === 'view' ? 'ro' : 'rw';
     }
    }
  ],

  methods: [
  ]
});

/*


    {
      name: 'controllerMode',
      choices: [ 'create', 'modify', 'view' ],
      defaultValueFn: function() { return this.X.controllerMode || 'create'; }
    },
*/
