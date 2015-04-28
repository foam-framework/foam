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
      label: 'View model name, model definition, or JSON with a factory_ specified.',
    },
    {
      name: 'args',
      label: 'View construction arguments',
      defaultValueFn: function() { return {}; }
    },
    {
      name: 'copyFrom',
      label: "Additional arguments to this.copyFrom(...) when ready."
    },
    {
      name: 'view',
      type: 'foam.ui.View',
      adapt: function(_, v) { return v.toView_(); },
      documentation: function() {/*
        The new sub-$$DOC{ref:'foam.ui.View'} generated for the given $$DOC{ref:'Property'}.
      */}
    },
  ],

  methods: {
    init: function() {
      this.SUPER();
      this.construct();
    },

    mergeWithCopyFrom: function(other) { /* Override/Append to args, typically
      used to merge in $$DOC{ref:'.model'} if it is a JSON object. */
      for (var key in other) {
        if ( key == 'factory_' ) continue;
        this.copyFrom[key] = other[key];
      }
    },

    construct: function() { /* Picks the model to create, then passes off to $$DOC{ref:'.finishRender'}. */
      // HACK to ensure model-for-model works. It requires that 'model', if specified,
      // be present in the create({ args }). Since we set Actions and Properties as
      // the create arg object sometimes, we must temporarily transfer the model
      // value from copyFrom to args, then unset it after the create.
      if ( this.copyFrom && this.copyFrom.model ) {
        this.args.__ASV_OLD_MODEL = this.args.model;
        this.args.model = this.copyFrom.model;
      }

      if ( this.copyFrom && this.copyFrom.model_ && typeof this.copyFrom.model_ === 'string' ) {
        return this.requireModelName(this.copyFrom.model_);
      }
      if ( typeof this.model === 'string' ) { // string model name
        return this.requireModelName(this.model);
      }
      if ( this.model.model_ && typeof this.model.model_ === 'string' ) { // JSON instance def'n
        this.view = FOAM(this.model); // FOAMalize the definition
        return this.requireViewInstance();
      }
      if ( this.model.model_ ) { // JSON with Model instance specified in model_
        this.mergeWithCopyFrom(this.model);
        this.view = this.model.model_.create(this.args, this.X); // clone-ish
        return this.finishRender();
      }
      if ( this.model.factory_ ) { // JSON with string factory_ name
        // remove 'view' from copyFrom JSON
        this.copyFrom = {__proto__: this.copyFrom, view: undefined};
        this.mergeWithCopyFrom(this.model);
        return this.requireModelName(this.model.factory_);
      }
      if ( typeof this.model === 'function' ) {
        this.view = this.model(this.args, this);
        return this.finishRender();
      }
      if ( this.model.create ) {
        this.view = this.model.create(this.args);
        return this.finishRender();
      }
      console.warn("AsyncViewLoader: View load with invalid model. ", this.model, this.args, this.copyFrom);
    },

    requireViewInstance: function() {
      this.view.arequire(this.X)(function(m) {
        this.finishRender();
      }.bind(this));
    },

    requireModelName: function(name) {
      arequire(name, this.X)(function(m) {
        // lookup again to ensure we get registerModel replacements
        this.view = this.X.lookup(name, this.X).create(this.args, this.X);
        this.finishRender();
      }.bind(this));
    },

    finishRender: function() {
      if ( this.copyFrom ) {
        var v = this.view;
        var vId = v.id;
        v.copyFrom(this.copyFrom);
        v.id = vId;
      }
      this.addDataChild(this.view);

      var el = this.X.$(this.id);
      if ( el ) {
        el.outerHTML = this.toHTML();
        this.initHTML();
      }

      // unhack args.model
      if ( this.args.__ASV_OLD_MODEL ) {
        this.args.model = this.args.__ASV_OLD_MODEL;
        this.args.__ASV_OLD_MODEL = undefined;
      }
    },

    toHTML: function() {
      /* If the view is ready, pass through to it. Otherwise create a place
      holder tag with our id, which we replace later. */
      return this.view ? this.view.toHTML() : ('<div id="'+this.id+'"></div>');
    },

    initHTML: function() {
      this.view && this.view.initHTML();
    },

    toString: function() { /* Name info. */ return 'AsyncViewLoader(' + this.model + ', ' + this.view + ')'; },

    fromElement: function(e) { /* passthru */
      this.view.fromElement(e);
      return this;
    },
  },

 });
