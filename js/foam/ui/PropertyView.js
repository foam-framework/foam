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
  name: 'PropertyView',
  extendsModel: 'foam.ui.BasePropertyView',

  documentation: function() {/*
    Used by $$DOC{ref:'foam.ui.DetailView'} to generate a sub-$$DOC{ref:'foam.ui.View'} for one
    $$DOC{ref:'Property'}. The $$DOC{ref:'foam.ui.View'} chosen can be based off the
    $$DOC{ref:'Property.view',text:'Property.view'} value, the $$DOC{ref:'.innerView'} value, or
    $$DOC{ref:'.args'}.model_.
  */},

  properties: [
    {
      name:  'id',
      label: 'Element ID',
      type:  'String',
      documentation: function() {/*
        The DOM element id for the outermost tag of
        this $$DOC{ref:'foam.ui.View'}. Set this when creating a PropertyView.
      */}
    }
  ],

  methods: {
    finishPropertyRender: function() {
      this.SUPER();
      if ( ! this.$ ) return;
      this.$.outerHTML = this.toInnerHTML();
      this.initInnerHTML();
    },

    toInnerHTML: function() { /* Passthrough to $$DOC{ref:'.view'} */
      return this.view ? this.view.toHTML() : "";
    },

    toHTML: function() {
      /* If the view is ready, pass through to it. Otherwise create a place
      holder tag with our id, which we replace later. */
      return this.view ? this.toInnerHTML() :  ('<div id="'+this.id+'"></div>');
    },

    initHTML: function() {
      this.view && this.view.initHTML();
    }
  }
});
