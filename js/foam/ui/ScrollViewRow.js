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
  package: 'foam.ui',
  name: 'ScrollViewRow',
  documentation: 'Wrapper for a single row in a $$DOC{ref: "ScrollView"}. Users should not need to create these. TODO: I should be a submodel of ScrollView once that\'s possible.',
  requires: [
    'foam.ui.DetailView'
  ],
  properties: [
    {
      name: 'data',
      postSet: function(old, nu) {
        if ( this.view ) {
          this.view.data = nu;
          // DetailViews will update on data changing, but others won't.
          if ( ! this.DetailView.isInstance(this.view) ) {
            var e = this.X.$(this.id);
            e.innerHTML = this.view.toHTML();
            this.view.initHTML();
          }
        }
      }
    },
    {
      name: 'view',
      postSet: function(old, nu) {
        if ( nu ) nu.data = this.data;
      }
    },
    {
      name: 'id',
    },
    {
      name: 'y',
      postSet: function(old, nu) {
        if ( this.view && this.id && old !== nu ) {
          // TODO(kg): this.X.$(this.id) should be the same as this.$, but that doesn't work for some unknown reason.
          this.X.$(this.id).style.webkitTransform = 'translate3d(0px,' + nu + 'px, 0px)';
        }
      }
    }
  ],
  methods: {
    destroy: function( isParentDestroyed ) {
      this.view.destroy(isParentDestroyed);
    }
  }
});
