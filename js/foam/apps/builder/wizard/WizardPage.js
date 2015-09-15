/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

CLASS({
  package: 'foam.apps.builder.wizard',
  name: 'WizardPage',
  extendsModel: 'foam.ui.md.DetailView',

  requires: [
    'foam.ui.md.UpdateDetailView',
  ],

  imports: [
    'stack',
    'dao',
    'popup',
    'wizardStack'
  ],


  properties: [
    {
      model_: 'foam.apps.builder.wizard.WizardViewFactoryProperty',
      name: 'nextViewFactory',
      postSet: function(old,nu) {
        this.nextView = ( nu ) ? nu({ data$: this.data$ }, this.X) : null;
      }
    },
    {
      name: 'nextView',
      lazyFactory: function() {
        return ( this.nextViewFactory ) ? this.nextViewFactory({ data$: this.data$ }, this.X) : null;
      },
      postSet: function(old,nu) {
        if ( old ) {
          Events.unfollow(old.title$, this.nextTitle$);
          old.destroy();
          if ( old.$ ) old.$.outerHTML = '';
        }
        if ( nu ) {
          Events.follow(nu.title$, this.nextTitle$);
          if ( this.hidden ) {
            this.propertyChange('title', null, this.title); // notify title listeners it might have changed
          }
        } else {
          this.nextTitle = this.model_.NEXT_TITLE.defaultValue;
        }
      }
    },
    {
      model_: 'StringProperty',
      name: 'nextTitle',
      defaultValue: 'Finish',
    },
    {
      model_: 'StringProperty',
      name: 'title',
      getter: function(name) {
        if ( ! this.hidden ) {
          var value = this.instance_[name];
          if ( typeof value === 'undefined' ) {
            var prop = this.model_.getProperty(name);
            if ( prop.lazyFactory ) {
              value = this.instance_[prop.name] = prop.lazyFactory.call(this, prop);
            } else if ( prop.factory ) {
              value = this.instance_[prop.name] = prop.factory.call(this, prop);
            } else if ( prop.defaultValueFn ) {
              value = prop.defaultValueFn.call(this, prop);
            } else if ( typeof prop.defaultValue !== undefined ) {
              value = prop.defaultValue;
            }
          }
          return value;
        }
        if ( this.nextView ) return this.nextView.title;

        return "Finish";
      }
    },
    {
      model_: 'BooleanProperty',
      name: 'hidden',
      defaultValue: false,
    }
  ],

  actions: [
    {
      name: 'nextAction',
      labelFn: function() {
        return this.nextTitle;
      },
      code: function() {
        this.onNext();
        var X = this.X;
        var nextV = this.nextView;
        if ( ! nextV ) {
          // no next view, so we're finished
          this.popup && this.popup.close();
          this.stack.popView();
          return;
        }
        if ( nextV.hidden ) {
          nextV.nextAction(); // don't add the hidden views to the stack, just plow straight through
        } else {
          this.stack.pushView(nextV);
          nextV.onShown(); // TODO: do this in the stackview?
        }
      }
    },
    {
      name: 'exit',
      label: 'Cancel',
      isAvailable: function() { return this.stack.views_.length <= 1; },
      code: function() {
        this.onCancel();
        this.popup && this.popup.close();
      }
    },
    {
      name: 'back',
      label:  'Back',
      isAvailable: function() { return this.stack.views_.length > 1; },
      code: function() {
        this.onBack();
        //this.popup && this.popup.close();
        if ( this.stack.views_.length <= 1 ) {
          this.onCancel();
          this.popup && this.popup.close();
        }
        this.stack.popView();
      }
    }
  ],

  methods: [
    function init() {
      this.SUPER();
      this.nextViewFactory = this.nextViewFactory;
    },
    function onNext() {
      /* if you need to do anything when the user picks the 'next' action,
        implement this method. Remember to call this.SUPER() at the end of your
        implementation, or handle saving this.data yourself. */
      this.dao && this.dao.put(this.data);
    },
    function onCancel() {
      /* if you need to do anything when the user picks the 'cancel' action, implement this method */
    },
    function onBack() {
      /* if you need to do anything when the user picks the 'back' action, implement this method */
    },
    function onShown() {
      /* if you need to do anything when the page is shown, implement this method */
      // TODO: skip to next page if hidden?
    },
  ],

  templates: [
    function titleHTML() {/*
      <p class="md-style-trait-standard md-title"><%# this.title %></p>
    */},
    function instructionHTML() {/*
    */},
    function contentHTML() {/*
    */},
    function toHTML() {/*
      <wizard id="%%id" <%= this.cssClassAttr() %>>
        <div class="md-card-heading">
          <% this.titleHTML(out); %>
        </div>
        <div class="md-card-heading-content-spacer"></div>
        <div class="md-card-content">
          <% this.instructionHTML(out); %>
          <% this.contentHTML(out); %>
        </div>
        <div class="md-card-content-footer-spacer"></div>
        <div class="md-actions md-card-footer horizontal">
            $$exit{ model_: 'foam.ui.md.FlatButton' }
            $$back{ model_: 'foam.ui.md.FlatButton' }
            $$nextAction{ model_: 'foam.ui.md.FlatButton' }
        </div>
      </wizard>
    */},
    function CSS() {/*
      wizard {
        display: flex;
        flex-direction: column;
        height: 100%
      }

    */},
  ],


});
