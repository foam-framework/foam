/**
 * @license
 * Copyright 2012 Google Inc. All Rights Reserved.
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
  package: 'foam.ui.search',
  name: 'SearchView',
  extends: 'foam.ui.View',

  requires: [ 'foam.ui.search.GroupBySearchView' ],

  properties: [
    {
      name: 'dao'
    },
    {
      name: 'model'
    },
    {
      name: 'predicate',
      defaultValue: TRUE
    }
  ],

  methods: [
    function buildSubViews() {
      var props = this.model.searchProperties;
      for ( var i = 0; i < props.length; i++ ) {
        var view = this.GroupBySearchView.create({
          dao: this.dao,
          property: this.model[constantize(props[i])]
        });
        this.addChild(view);
        view.addPropertyListener(
          'predicate',
          this.updatePredicate
        );
      }
    },

    function toInnerHTML() {
      if ( ! this.children.length )
        this.buildSubViews();

      var str = '';
      for ( var i = 0; i < this.children.length; i++ ) {
        str += this.children[i].toHTML();
      }
      return str;
    }
  ],

  listeners: [
    {
      name: 'updatePredicate',
      code: function() {
        var p = TRUE;
        for ( var i = 0; i < this.children.length; i++ ) {
          var view = this.children[i];
          if ( view.predicate ) {
            p = AND(p, view.predicate);
          }
        }
        this.predicate = p.partialEval();
      }
    }
  ]
});
