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
  package: 'foam.u2.md',
  name: 'EditColumnsView',
  extends: 'foam.u2.Element',

  requires: [
    'foam.u2.md.Checkbox',
  ],

  properties: [
    {
      name: 'properties',
    },
    {
      name: 'selectedProperties',
    },
  ],

  methods: [
    function selectedMap() {
      var selected = {};
      for (var i = 0; i < this.selectedProperties.length; i++) {
        selected[this.selectedProperties[i].name] = true;
      }
      return selected;
    },
    function initE() {
      var selected = this.selectedMap();
      for (var i = 0; i < this.properties.length; i++) {
        var cb = this.Checkbox.create({
          label: this.properties[i].label,
          data: selected[this.properties[i].name]
        });
        cb.data$.addListener(this.onPropChange.bind(this, this.properties[i]));
        this.add(cb);
      }
    },
  ],

  listeners: [
    function onPropChange(prop, _, __, old, nu) {
      var selected = this.selectedMap();
      var out = [];

      for (var i = 0; i < this.properties.length; i++) {
        var p = this.properties[i];
        // Push under two conditions: selected and not just removed,
        // or not selected but just added.
        if ((p === prop && nu) || (selected[p.name] && (p !== prop || nu))) {
          out.push(p);
        }
      }

      this.selectedProperties = out;
    },
  ]
});
