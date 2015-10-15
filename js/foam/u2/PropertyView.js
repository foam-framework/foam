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
  name: 'PropertyView',

  extends: 'foam.u2.Element',

  requires: [
    'Property',
    'foam.u2.Input'
  ],

  properties: [
    {
      name: 'data'
    },
    {
      name: 'prop'
    },
    [ 'nodeName', 'tr' ]
  ],

  templates: [
    function CSS() {/*
      .foam-u2-PropertyView-label {
        color: #444;
        display: block;
        float: left;
        font-size: 12px;
        padding-left: 6px;
        padding-top: 6px;
        text-align: right;
        vertical-align: top;
      }
    */}
  ],

  methods: [
    function init() {
      this.SUPER();

      var view = this.prop.toE();

      // TODO: Why can't I just define this with data$ in the view constructor?
      // Is data$ linking the wrong way?
      Events.link(this.data.propertyValue(this.prop.name), view.data$);
      this.cls('foam-u2-PropertyView').add(
        E('td').cls('foam-u2-PropertyView-label').add(this.prop.label),
        E('td').cls('foam-u2-PropertyView-view').add(view));
    }
  ]
});
