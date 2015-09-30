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
      model_: 'FloatProperty',
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
      defaultValue: Movement.easeOut(0.9)
    },
    {
      model_: 'FloatProperty',
      name: 'fwdDuration',
      defaultValue: 100
    },
    {
      model_: 'FloatProperty',
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
        Events.dynamic(function() {
          this.easing;
          this.fwdDuration;
          this.fwdDirection;
          this.fwdAnimation = this.getAnimation('fwd');
        }.bind(this));
        Events.dynamic(function() {
          this.easing;
          this.bwdDuration;
          this.bwdDirection;
          this.bwdAnimation = this.getAnimation('bwd');
        }.bind(this));
      }
    },
    {
      name: 'initHTML',
      code: function() {
        var initialTransform = this.element.style.transform ||
            this.element.style.webkitTransform;

        this.popup.alpha = 1;
        this.popup.zoom = 1;
        this.setInitialPosition(true);
      }
    },
    {
      name: 'getAnimation',
      code: function(wd) {
        return Movement.animate(
            this[wd + 'Duration'],
            function() {
              this.rotation += this[wd + 'Direction'] === 'clockwise' ?
                  0.5 : -0.5;
            }.bind(this),
            this.easing,
            function() {
              this.rotation = this.rotation % 360;
            }.bind(this));
      }
    },
    {
      name: 'setRotationStyle',
      code: function() {
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
