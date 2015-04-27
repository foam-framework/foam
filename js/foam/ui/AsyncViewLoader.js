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
   name: 'AsyncViewLoader',
   package: 'foam.ui',
   extendsModel: 'foam.ui.BaseView',

   documentation: function() {/* Loads a view with arequire, giving the
     host view a placeholder immediately and filling in the actual view
     when it is available.
   */},

  properties: [
    {
      name:  'id',
      label: 'Element ID',
      type:  'String',
      documentation: function() {/*
        The DOM element id for the outermost tag of
        this $$DOC{ref:'foam.ui.View'}. Set this when creating an AsyncViewLoader.
      */}
    },
    {
      name: 'name',
      label: "The parent view's name for this"
    },
    {
      name: 'model',
      label: 'View model name'
    },
    {
      name: 'args',
      label: 'View construction arguments'
    },
    {
      name: 'copyFrom',
      label: "Additional arguments to this.copyFrom(...) when ready."
    },
    {
      name: 'view'
    }
  ],

  methods: {
    init: function() {
      arequire(this.model, this.X)(function(m) {
        // lookup again to ensure we get registerModel replacements
        var v = this.X.lookup(this.model, this.X).create(this.args, this.X);
        console.assert(v, "AsyncViewLoader failed to load ", this.model);
        if ( this.copyFrom ) {
          v.copyFrom(this.copyFrom);
        }
        this.view = v.toView_();
        this.addDataChild(this.view);
        this.finishRender();
      }.bind(this));
    },

    finishRender: function() {
      var el = this.X.$(this.id);
      if ( el ) {
        el.outerHTML = this.toHTML();
        this.initHTML();
      }
    },

    toHTML: function() {
      /* If the view is ready, pass through to it. Otherwise create a place
      holder tag with our id, which we replace later. */
      return this.view ? this.view.toHTML() : ('<div id="'+this.id+'"></div>');
    },

    initHTML: function() {
      this.view && this.view.initHTML();
    }
  },

 });
