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
  name: 'DualView', // TODO: Rename AbstractDualView
  extends: 'foam.u2.Element',

  requires: [ 'foam.u2.Input' ], // TODO: Remove

  properties: [
    'data'
  ],

  methods: [
    function init() {
      this.SUPER();
      if ( this.isLoaded() ) {
        this.initReadView();
      } else {
        this.listenForLoad();
      }
    },
    function initReadView() {
      this.add(this.toReadE());
    },
    function initWriteView() {
      this.add(this.toWriteE());
    },

    // Template Methods
    function isLoaded() {
      return this.data;
    },
    function listenForLoad() {
      this.data$.addListener(this.onDataLoad);
    },
    function toReadE() {
      return this.data$;
    },
    function toWriteE() {
      return this.E('input').attrs({data$: this.data$}).style({background:'pink'});
    }
  ],

  listeners: [
    function onDataLoad() {
      this.data$.removeListener(this.onDataLoad);
      this.initReadView();
    }
  ]
});
