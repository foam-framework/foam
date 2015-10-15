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
  name: 'WizardViewFactoryProperty',
  extends: 'ViewFactoryProperty',

  properties: [
    {
      name: 'getter',
      defaultValue: function(name) {
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
          if ( value ) this.instance_[name] = value;
        }

        // when null or no value is specified, check for additional wizard pages on X.wizardStack
        if ( ! value && this.wizardStack && this.wizardStack.length ) {
          // the next view gets a clone wizardStack that has been 'popped'
          var X = this.Y.sub({ wizardStack: this.wizardStack.slice(0, -1) });
          var viewFactory = this.wizardStack[this.wizardStack.length - 1];
          value = function(args, unused_X) {
            return viewFactory(args, X);
          }
          if ( value ) this.instance_[name] = value;
        }
        return value;
      }
    },
  ],


});
