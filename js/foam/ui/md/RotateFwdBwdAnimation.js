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
  name: 'RotateFwdBwdAnimation',
  package: 'foam.ui.md',

  constants: { ROTATE_CSS_REG_EX: /rotate\([0-9.-]+[a-zA-Z]*\)[;]?/g },

  properties: [
    {
      name: 'element',
      required: true,
      postSet: function(old, nu) {
        if ( old === nu ) return;
        if ( nu ) this.setRotationStyle();
      }
    },
    {
      type: 'Float',
      name: 'rotation',
      units: 'turns',
      defaultValue: 0,
      preSet: function(_, nu) {
        return Math.round(nu * 1000) / 1000;
      },
      postSet: function(old, nu) {
        if ( old === nu ) return;
        this.setRotationStyle();
      }
    },
    {
      name: 'easing',
      lazyFactory: function() { return Movement.easeOut(0.9); }
    },
    {
      type: 'Float',
      name: 'fwdDuration',
      defaultValue: 100
    },
    {
      type: 'Float',
      name: 'bwdDuration',
      defaultValue: 100
    },
    {
      name: 'fwdDirection',
      defaultValue: 'clockwise'
    },
    {
      name: 'bwdDirection',
      defaultValue: 'counter-clockwise'
    },
    {
      name: 'fwdAnimation',
      lazyFactory: function() {
        return this.getAnimation('fwd');
      }
    },
    {
      name: 'bwdAnimation',
      lazyFactory: function() {
        return this.getAnimation('bwd');
      }
    }
  ],

  methods: [
    {
      name: 'init',
      code: function() {
        this.SUPER.apply(this, arguments);
        this.X.dynamicFn(function() {
          this.easing;
          this.fwdDuration;
          this.fwdDirection;
          this.fwdAnimation = this.getAnimation('fwd');
        }.bind(this));
        this.X.dynamicFn(function() {
          this.easing;
          this.bwdDuration;
          this.bwdDirection;
          this.bwdAnimation = this.getAnimation('bwd');
        }.bind(this));
      }
    },
    {
      name: 'getAnimation',
      code: function(wd) {
        return this.X.animate(
            this[wd + 'Duration'],
            function() {
              this.rotation += this[wd + 'Direction'] === 'clockwise' ?
                  0.5 : -0.5;
            }.bind(this),
            this.easing,
            function() {
              this.rotation = Math.round(this.rotation * 2) / 2;
            }.bind(this));
      }
    },
    {
      name: 'setRotationStyle',
      code: function() {
        if ( ! this.element ) return;
        var style = this.element.style,
            initialTransform = style.transform,
            strippedTransform = initialTransform.replace(
                this.ROTATE_CSS_REG_EX, '');
        if ( strippedTransform &&
            strippedTransform[strippedTransform.length - 1] !== ';' )
          strippedTransform += ';';
        style.transform = strippedTransform +
            'rotate(' + this.rotation + 'turn)';
      }
    }
  ]
});
