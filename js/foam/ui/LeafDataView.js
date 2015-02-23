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
  name: 'LeafDataView',
  package: 'foam.ui',
  extendsModel: 'foam.ui.BaseView',

  documentation: function() {/* For Views that use $$DOC{ref:'.data'},
    but do not pass it along to any children, use this trait.
  */},

  properties: [
    {
      name: 'data',
      documentation: function() {/* The actual data used by the view.
        Not progated to children, as it is assumed no children are present.
         */}
    }
  ],
  
  methods: {
    addDataChild: function(child) {
      /* Don't pass data, just do a regular addChild. */
      this.addChild(child);
    },
    addSelfDataChild: function(child) {
      /* Don't pass self as data, just do a regular addChild. */
      this.addChild(child);
    }
  }
    
});
