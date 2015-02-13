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
  name: 'SimpleView',
  package: 'foam.ui',
  extendsModel: 'foam.patterns.ChildTreeTrait',

  documentation: function() {/* For Views that do not use $$DOC{ref:'.data'},
    this trait will still allow cooperation with Views that do. If you
    plan to export or import data, do not use this trait. This trait expects
    to be applied after $$DOC{ref:'foam.patterns.ChildTreeTrait'}.
  */},

  properties: [
    {
      name: 'data',
      postSet: function() {
        this.children.forEach(function(child) {
          // special case for BaseView, since it exports itself to certain children
          if ( child.data !== this ) {
            child.data = this.data;
          }
        }.bind(this));
      },
      documentation: function() {/* The postSet supplied here will
        propagate the change to children. Those children are responsible
        for either passing on the change or exporting to their contexts
        if they actually handle data.
      */}
    }
  ],
  methods: {
    addChild: function(child) {
      this.SUPER(child);
      if ( this.data ) {
        // if our data was set on initialization, we didn't have children to 
        // propagate it to yet. Since we can't export to the context, better
        // set it now...
        child.data = this.data;
      }
    }
  }
  
});
