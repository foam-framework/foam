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

  requires: [ 'foam.ui.md.CSSProperty' ],

  properties: [
    { model_: 'foam.ui.md.CSSProperty', name: 'background-color' },
    { model_: 'foam.ui.md.CSSProperty', name: 'background-position' },
    { model_: 'foam.ui.md.CSSProperty', name: 'border-bottom-color' },
    { model_: 'foam.ui.md.CSSProperty', name: 'border-bottom-width' },
    { model_: 'foam.ui.md.CSSProperty', name: 'border-left-color' },
    { model_: 'foam.ui.md.CSSProperty', name: 'border-left-width' },
    { model_: 'foam.ui.md.CSSProperty', name: 'border-right-color' },
    { model_: 'foam.ui.md.CSSProperty', name: 'border-right-width' },
    { model_: 'foam.ui.md.CSSProperty', name: 'border-spacing' },
    { model_: 'foam.ui.md.CSSProperty', name: 'border-top-color' },
    { model_: 'foam.ui.md.CSSProperty', name: 'border-top-width' },
    { model_: 'foam.ui.md.CSSProperty', name: 'bottom' },
    { model_: 'foam.ui.md.CSSProperty', name: 'clip' },
    { model_: 'foam.ui.md.CSSProperty', name: 'color' },
    { model_: 'foam.ui.md.CSSProperty', name: 'font-size' },
    { model_: 'foam.ui.md.CSSProperty', name: 'font-weight' },
    { model_: 'foam.ui.md.CSSProperty', name: 'height' },
    { model_: 'foam.ui.md.CSSProperty', name: 'left' },
    { model_: 'foam.ui.md.CSSProperty', name: 'letter-spacing' },
    { model_: 'foam.ui.md.CSSProperty', name: 'line-height' },
    { model_: 'foam.ui.md.CSSProperty', name: 'margin-bottom' },
    { model_: 'foam.ui.md.CSSProperty', name: 'margin-left' },
    { model_: 'foam.ui.md.CSSProperty', name: 'margin-right' },
    { model_: 'foam.ui.md.CSSProperty', name: 'margin-top' },
    { model_: 'foam.ui.md.CSSProperty', name: 'max-height' },
    { model_: 'foam.ui.md.CSSProperty', name: 'max-width' },
    { model_: 'foam.ui.md.CSSProperty', name: 'min-height' },
    { model_: 'foam.ui.md.CSSProperty', name: 'min-width' },
    { model_: 'foam.ui.md.CSSProperty', name: 'opacity' },
    { model_: 'foam.ui.md.CSSProperty', name: 'outline-color' },
    { model_: 'foam.ui.md.CSSProperty', name: 'outline-width' },
    { model_: 'foam.ui.md.CSSProperty', name: 'padding-bottom' },
    { model_: 'foam.ui.md.CSSProperty', name: 'padding-left' },
    { model_: 'foam.ui.md.CSSProperty', name: 'padding-right' },
    { model_: 'foam.ui.md.CSSProperty', name: 'padding-top' },
    { model_: 'foam.ui.md.CSSProperty', name: 'right' },
    { model_: 'foam.ui.md.CSSProperty', name: 'text-indent' },
    { model_: 'foam.ui.md.CSSProperty', name: 'text-shadow' },
    { model_: 'foam.ui.md.CSSProperty', name: 'top' },
    { model_: 'foam.ui.md.CSSProperty', name: 'vertical-align' },
    { model_: 'foam.ui.md.CSSProperty', name: 'visibility' },
    { model_: 'foam.ui.md.CSSProperty', name: 'width' },
    { model_: 'foam.ui.md.CSSProperty', name: 'word-spacing' },
    { model_: 'foam.ui.md.CSSProperty', name: 'z-index' },
    {
      name: 'cssProperties_',
      factory: function() {
        var o = {};
        this.model_.getRuntimeProperties().forEach(function(p) {
          if ( this[p.name] && (p.model_ === 'foam.ui.md.CSSProperty' || this.CSSProperty.isInstance(p)) ) {
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
