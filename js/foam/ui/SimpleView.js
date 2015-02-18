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

  documentation: function() {/* For Views that use $$DOC{ref:'.data'},
    this trait will pseudo-import the data$ reference from the context,
    or allow setting of the $$DOC{ref:'.data'} property directly.
  */},

  properties: [
    {
      name: 'data',
      documentation: function() {/* The actual data used by the view.
        Children's data will be bidirectionally bound to this property.
        If you want to give your children differing data, use
        $$DOC{ref:'foam.ui.LeafDataView'} or
        $$DOC{ref:'foam.ui.DestructiveDataView'}.
      */}
    }
  ],
  
  methods: {
    addChild: function(child) {
      this.SUPER(child);
      Events.link(this.data$, child.data$);
    },
    removeChild: function(child) {
      Events.unlink(this.data$, child.data$);
      this.SUPER(child);
    }
  }
  
});
