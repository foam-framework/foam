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
  package: 'com.google.mail',
  name: 'MenuLabelCitationView',
  extends: 'foam.ui.DetailView',
  requires: ['SimpleValue'],
  imports: [
    'counts',
    'controller'
  ],
  properties: [
    {
      name: 'count',
      view: { factory_: 'foam.ui.TextFieldView', mode: 'read-only', extraClassName: 'count' }
    }
  ],

  methods: {
    init: function() {
      this.SUPER();
      if ( this.counts.groups[this.data.id] ) this.bindGroup();
      else this.bindCounts();
    },
    bindCounts: function() {
      this.counts.addListener(this.bindGroup);
    }
  },
  listeners: [
    {
      name: 'bindGroup',
      code: function() {
        if ( this.counts.groups[this.data.id] ) {
          this.counts.removeListener(this.bindGroup);
          this.counts.groups[this.data.id].addListener(this.updateCount);
          this.updateCount();
        }
      }
    },
    {
      name: 'updateCount',
      code: function() {
        if ( this.counts.groups[this.data.id] )
          this.count = this.counts.groups[this.data.id].count;
      }
    }
  ],
  templates: [
    function CSS() {/*
      .label-row {
        height: 42px;
        line-height: 42px;
        padding-left: 15px;
        display: flex;
        align-items: center;
      }
      .label-row img {
        height: 24px;
        width: 24px;
        opacity: 0.6;
        margin-right: 25px;
        flex-grow: 0;
        flex-shrink: 0;
      }
      .label-row .label {
        flex-grow: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .label-row .count {
        flex-grow: 0;
        flex-shrink: 0;
        margin-right: 10px;
        text-align: center;
        text-align: right;
        width: 40px;
      }
    */},
    function toHTML() {/*
      <div id="%%id" class="label-row">
        $$iconUrl
        $$label{mode: 'read-only', extraClassName: 'label' }
        $$count
      </div>
    */}
  ]
});
