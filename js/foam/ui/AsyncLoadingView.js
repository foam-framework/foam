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
   name: 'AsyncLoadingView',
   extends: 'foam.ui.BaseView',

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
         this $$DOC{ref:'foam.ui.View'}. Set this when creating an AsyncLoadingView.
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
       label: "Additional arguments to this.copyFrom(...) when ready.",
      lazyFactory: function() { return {}; }
     },
     {
       name: 'view',
       // type: 'foam.ui.View',
       documentation: function() {/*
         The new sub-$$DOC{ref:'foam.ui.View'} generated for the given $$DOC{ref:'Property'}.
       */}
     }
   ],

   methods: [
     function init() {
       this.SUPER();

       /* Picks the model to create, then passes off to $$DOC{ref:'.finishRender'}. */
       // Decorators to allow us to skip over keys without copying them
       // as create() args
       var skipKeysArgDecorator = Object.create(this.args);
       skipKeysArgDecorator.hasOwnProperty = this.skipKeysFn_hasOwnProperty;
       skipKeysArgDecorator.inner = this.args;

       // HACK to ensure model-for-model works. It requires that 'model', if specified,
       // be present in the create({ args }). Since we set Actions and Properties as
       // the create arg object sometimes, we must temporarily transfer the model
       // value from copyFrom to args, but since we are wrapping it anyways we can
       // piggyback our model value on the wrapper.
       if ( this.copyFrom && this.copyFrom.model ) {
         skipKeysArgDecorator.model = this.copyFrom.model;
       }

       if ( this.copyFrom && this.copyFrom.model_ ) {
         if ( typeof this.copyFrom.model_ === 'string' ) { // string model_ in copyFrom
           return this.requireModelName(this.copyFrom.model_, skipKeysArgDecorator);
         } else if ( Model.isInstance(this.copyFrom.model_) ) { // or model instance
           return this.finishRender(this.copyFrom.model_.create(skipKeysArgDecorator, this.Y));
         }
       }
       if ( typeof this.model === 'string' ) { // string model name
         return this.requireModelName(this.model, skipKeysArgDecorator);
       }
       if ( this.model.model_ && typeof this.model.model_ === 'string' ) { // JSON instance def'n
         // FOAMalize the definition
         return this.requireViewInstance(FOAM(this.model));
       }
       if ( this.model.model_ ) {
         if ( Model.isInstance(this.model) ) { // is a model instance
           return this.finishRender(this.model.create(skipKeysArgDecorator, this.Y));
         } else {
           // JSON with Model instance specified in model_
           this.mergeWithCopyFrom(this.model);
           return this.finishRender(this.model.model_.create(skipKeysArgDecorator, this.Y));
         }
       }
       if ( this.model.factory_ ) { // JSON with string factory_ name
         // TODO: previously 'view' was removed from copyFrom to support CViews not getting their view stomped. Put back...
         this.mergeWithCopyFrom(this.model);
         return this.requireModelName(this.model.factory_, skipKeysArgDecorator);
       }
       if ( typeof this.model === 'function' ) { // factory function
         return this.finishRender(this.model(skipKeysArgDecorator, this.Y));
       }
       console.warn("AsyncLoadingView: View load with invalid model. ", this.model, this.args, this.copyFrom);
     },

     function mergeWithCopyFrom(other) {
       /* Override/Append to args, typically
          used to merge in $$DOC{ref:'.model'} if it is a JSON object. */
       for (var key in other) {
         if ( key == 'factory_' ) continue;
         this.copyFrom[key] = other[key];
       }
     },

     function skipKeysFn_hasOwnProperty(name) {
       return name != 'factory_' && name != 'model_' && name != 'view' && this.inner.hasOwnProperty(name);
     },

     function requireViewInstance(view) {
       view.arequire()(function(m) {
         this.finishRender(view);
       }.bind(this));
     },

     function requireModelName(name, args) {
       this.X.arequire(name)(function(m) {
         this.finishRender(m.create(args, this.Y));
       }.bind(this));
     },

     function finishRender(view) {
       if ( this.copyFrom ) {
         // don't copy a few special cases
         var skipKeysCopyFromDecorator = Object.create(this.copyFrom);
         skipKeysCopyFromDecorator.hasOwnProperty = this.skipKeysFn_hasOwnProperty;
         skipKeysCopyFromDecorator.inner = this.copyFrom;

         view.copyFrom(skipKeysCopyFromDecorator);
       }
       this.view = view.toView_();
       this.addDataChild(this.view);

       var el = this.X.$(this.id);
       if ( el ) {
         el.outerHTML = this.toHTML();
         this.initHTML();
       }
     },

     function toHTML() {
       /* If the view is ready, pass through to it. Otherwise create a place
          holder tag with our id, which we replace later. */
       return this.view ? this.view.toHTML() : ('<div id="'+this.id+'"></div>');
     },

     function initHTML() {
       this.view && this.view.initHTML();
     },

     function toString() { /* Name info. */ return 'AsyncLoadingView(' + this.model + ', ' + this.view + ')'; },

     function fromElement(e) { /* passthru */
       this.view.fromElement(e);
       return this;
     }
  ]
});
