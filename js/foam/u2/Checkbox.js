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
      name: 'data',
      postSet: function(o,n) {
        console.log('****: ', o, n);
      }
    }
  ],

  methods: [
    function init() {
      this.SUPER();
      this.attrs({type: 'checkbox'});
    //  var v = this.attrValue('checked', 'change');
    //  v.addListener(console.log.bind(console));
    //    Events.link(this.data$, v)
      this.data$ = this.attrValue('checked', 'change');
    }
  ]
});
