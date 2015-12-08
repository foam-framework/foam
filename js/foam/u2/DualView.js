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
  name: 'DualView',
  extends: 'foam.u2.Element',

  properties: [
    'data',
    {
      name: 'readViewFactory'
    },
    {
      name: 'writeViewFactory'
    }
  }

  methods: [
    function init() {
      this.SUPER();
      if ( this.data ) {
        this.initReadView();
      } else {
        this.data$.addListener(onDataChange);
      }
    },
    function initReadView() {
      this.add(this.E('input').style({background:'pink'});
    },
    function initReadView() {
      this.add(this.E('input'));
    },
  ],

  listeners: [
    function onDataChange() {
      this.data$.removeListener(this.onDataChange);
      this.initReadView();
    }
  ]
});
