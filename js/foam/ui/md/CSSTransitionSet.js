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
  package: 'foam.ui.md',
  name: 'CSSTransitionSet',

  models: [
    {
      model_: 'Model',
      name: 'CSSProperty',
      extendsModel: 'StringProperty',
      postSet: function(old, nu, prop) {
        this.cssString_ = null;
        if ( nu ) this.cssProperties_[prop.name] = nu;
        if ( ! nu && old ) delete this.cssProperties_[prop.name];
      }
    }
  ],

  properties: [
    { model_: 'CSSProperty', name: 'background-color' },
    { model_: 'CSSProperty', name: 'background-position' },
    { model_: 'CSSProperty', name: 'border-bottom-color' },
    { model_: 'CSSProperty', name: 'border-bottom-width' },
    { model_: 'CSSProperty', name: 'border-left-color' },
    { model_: 'CSSProperty', name: 'border-left-width' },
    { model_: 'CSSProperty', name: 'border-right-color' },
    { model_: 'CSSProperty', name: 'border-right-width' },
    { model_: 'CSSProperty', name: 'border-spacing' },
    { model_: 'CSSProperty', name: 'border-top-color' },
    { model_: 'CSSProperty', name: 'border-top-width' },
    { model_: 'CSSProperty', name: 'bottom' },
    { model_: 'CSSProperty', name: 'clip' },
    { model_: 'CSSProperty', name: 'color' },
    { model_: 'CSSProperty', name: 'font-size' },
    { model_: 'CSSProperty', name: 'font-weight' },
    { model_: 'CSSProperty', name: 'height' },
    { model_: 'CSSProperty', name: 'left' },
    { model_: 'CSSProperty', name: 'letter-spacing' },
    { model_: 'CSSProperty', name: 'line-height' },
    { model_: 'CSSProperty', name: 'margin-bottom' },
    { model_: 'CSSProperty', name: 'margin-left' },
    { model_: 'CSSProperty', name: 'margin-right' },
    { model_: 'CSSProperty', name: 'margin-top' },
    { model_: 'CSSProperty', name: 'max-height' },
    { model_: 'CSSProperty', name: 'max-width' },
    { model_: 'CSSProperty', name: 'min-height' },
    { model_: 'CSSProperty', name: 'min-width' },
    { model_: 'CSSProperty', name: 'opacity' },
    { model_: 'CSSProperty', name: 'outline-color' },
    { model_: 'CSSProperty', name: 'outline-width' },
    { model_: 'CSSProperty', name: 'padding-bottom' },
    { model_: 'CSSProperty', name: 'padding-left' },
    { model_: 'CSSProperty', name: 'padding-right' },
    { model_: 'CSSProperty', name: 'padding-top' },
    { model_: 'CSSProperty', name: 'right' },
    { model_: 'CSSProperty', name: 'text-indent' },
    { model_: 'CSSProperty', name: 'text-shadow' },
    { model_: 'CSSProperty', name: 'top' },
    { model_: 'CSSProperty', name: 'vertical-align' },
    { model_: 'CSSProperty', name: 'visibility' },
    { model_: 'CSSProperty', name: 'width' },
    { model_: 'CSSProperty', name: 'word-spacing' },
    { model_: 'CSSProperty', name: 'z-index' },
    {
      name: 'cssProperties_',
      factory: function() {
        var o = {};
        this.model_.getRuntimeProperties().forEach(function(p) {
          if ( this[p.name] && (p.model_ === 'CSSProperty' || this.CSSProperty.isInstance(p)) ) {
            o[p.name] = this[p.name];
          }
        }.bind(this));
        return o;
      }
    },
    {
      model_: 'StringProperty',
      name: 'cssString_'
    }
  ],

  methods: [
    {
      name: 'init',
      code: function() {
        this.SUPER.apply(this, arguments);
        // Set cssString_ after all factories have run.
        this.cssString_ = this.toString_();
      }
    },
    {
      name: 'getAll',
      code: function() {
        return Object.create(this.cssProperties_);
      }
    },
    {
      name: 'toString',
      code: function() {
        if ( this.cssString_ === null ) this.cssString_ = this.toString_();
        return this.cssString_;
      }
    },
    {
      name: 'toString_',
      code: function() {
        var out = '';
        var first = true;
        Object_forEach(this.cssProperties_, function(value, key) {
          if ( ! first ) out += ', ';
          out += key + ' ' + value;
          first = false;
        });
        return out;
      }
    }
  ]
});
