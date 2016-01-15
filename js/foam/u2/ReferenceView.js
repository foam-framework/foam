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
  name: 'ReferenceView',
  extends: 'foam.u2.View',
  requires: [
    'foam.u2.md.CitationView'
  ],
  properties: [
    'childDao',
    'subType',
    'obj'
  ],
  methods: [
    function fromProperty(p) {
      if ( ! p.subType ) {
        throw "No subtype for reference property.";
      }

      this.subType = this.X.lookup(p.subType);

      if ( ! this.subType ) {
        throw "Could not load subType" + p.subType;
      }

      this.childDao = this.X[daoize(this.subType.name)];
      if ( ! this.childDao ) {
        console.warn("Could not find this.X[" + daoize(this.subType.name) + "]");
      }
    },
    function initE() {
      var self = this;

      this.data$.addListener(this.onDataUpdate);
      this.onDataUpdate();

      this.start('div')
        .add(this.dynamic(function(obj) {
          if ( obj ) {
            return self.CitationView.create({ data: obj });
          }
          return '';
        }, self.obj$))
        .end();
    }
  ],
  listeners: [
    {
      name: 'onDataUpdate',
      code: function() {
        if ( ! this.childDao ) return;

        var self = this;
        this.childDao.find(this.data, {
          put: function(o) {
            self.obj = o;
          }
        });
      }
    }
  ]
});
