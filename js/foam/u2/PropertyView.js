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
    'foam.u2.TextField',
    'foam.u2.DateView'
  ],

  imports: [
    'data$'
  ],

  properties: [
    {
      name: 'data',
      postSet: function(old, nu) {
        this.bindData_(old, nu);
      }
    },
    {
      name: 'prop'
    },
    {
      name: 'view',
      attribute: true,
      adapt: function(_, v) {
        if ( typeof v === 'function' ) return v(this.Y);
        if ( typeof v === 'string' ) {
          var m = this.X.lookup(v);
          if ( m ) return m.create(undefined, this.Y);
        }
        return v;
      }
    },
    {
      name: 'child_',
    },
    [ 'nodeName', 'span' ]
  ],

  methods: [
    function initE() {
      var view = this.view || this.prop.toPropertyE(this.Y);
      var prop = this.prop;

      // TODO: remove check once all views extend View
      view.fromProperty && view.fromProperty(prop);

      this.child_ = view;
      this.cls(this.myCls());
      this.add(this.child_);
      this.bindData_(null, this.data);
    },
    // Set properties on delegate view instead of this
    function attrs(map) {
      this.view.attrs(map);
      return this;
    }
  ],

  listeners: [
    function bindData_(old, nu) {
      if ( ! this.child_ ) return;
      if ( old ) Events.unlink(old.propertyValue(this.prop.name), this.child_.data$);
      if ( nu  ) Events.link(nu.propertyValue(this.prop.name), this.child_.data$);
    }
  ]
});
