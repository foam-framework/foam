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

// TODO: Add datalist support.

CLASS({
  package: 'foam.u2',
  name: 'Checkbox',
  extends: 'foam.u2.Element',

  properties: [
    [ 'nodeName', 'input' ],
    {
      model_: 'BooleanProperty',
      name: 'data'
    },
    {
      name: 'mode',
      defaultValue: 'rw',
      postSet: function(old, mode) {
        // checkboxes don't have a readonly mode, so treat readonly the same as disabled
        if ( old === mode ) return;

        if ( old === 'ro' || old === 'disabled' ) this.setAttribute('disabled', false);

        if ( mode === 'ro' || mode === 'disabled' ) this.setAttribute('disabled', true);
        else if ( mode === 'hidden' ) this.hide();
      }
    }
  ],

  methods: [
    function init() {
      this.SUPER();
      this.attrs({type: 'checkbox'});
      Events.link(this.data$, this.attrValue('checked', 'change'));
    }
  ]
});
