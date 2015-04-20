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
      var v = this.X.lookup(this.model, this.X).create(this.args, this.X);
      if ( this.copyFrom ) {
        v.copyFrom(this.copyFrom);
      }
//      this.finishRender();

      arequire(this.model, this.X)(function(m) {
        this.view = m.create(this.args, this.X);
        if ( this.copyFrom ) {
          this.view.copyFrom(this.copyFrom);
        }
        //this.view = this.view.toView_();
        //this.finishRender();
        console.log(this.$UID,"finished render", m.X.NAME, this.view.name_);
      }.bind(this));
      console.log(this.$UID,"finished init", v, this.view);
     },

    finishRender: function() {
      if ( this.$ ) {
        this.$.outerHTML = this.toInnerHTML();
        this.initInnerHTML();
      }
      // replace self in the view tree
      if ( this.parent ) {
        var p = this.parent;
        p.addChild(this.view);
        p.removeChild(this);
        if ( this.name ) {
          p[this.name + 'View'] = this.view;
        }
      }
    },

    toInnerHTML: function() { /* Passthrough to $$DOC{ref:'.view'} */
      return this.view ? this.view.toHTML() : "";
    },

    toHTML: function() {
      /* If the view is ready, pass through to it. Otherwise create a place
      holder tag with our id, which we replace later. */
      return this.view ? this.toInnerHTML() : ('<div id="'+this.id+'"></div>');
    },

    initHTML: function() {
      this.view && this.view.initHTML();
    }
  },

 });
