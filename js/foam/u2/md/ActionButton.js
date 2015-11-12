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
  package: 'foam.u2.md',
  name: 'ActionButton',
  extends: 'foam.u2.View',

  requires: [
    'foam.ui.Color',
    'foam.ui.Icon',
    'foam.ui.md.HaloView',
  ],
  imports: [ 'window' ],

  properties: [
    [ 'nodeName', 'ACTION-BUTTON' ],
    {
      type: 'Action',
      name: 'action',
    },
    {
      name: 'type',
      choices: ['label', 'icon', 'floating'],
      defaultValueFn: function() {
        return this.action.ligature || this.action.iconUrl ? 'icon' : 'label';
      }
    },
    {
      name: 'halo',
      lazyFactory: function() {
        return this.HaloView.create({
          className: 'halo',
          color$: this.color_$,
          recentering: false,
          pressedAlpha: 0.2,
          startAlpha: 0.2,
          finishAlpha: 0
        }, this.Y);
      },
    },
    {
      name: 'icon',
      lazyFactory: function() {
        return this.Icon.create({
          url$: this.action.iconUrl$,
          ligature$: this.action.ligature$,
          color$: this.color_$
        }, this.Y);
      }
    },
    {
      model_: 'foam.ui.ColorProperty',
      name: 'color',
      defaultValueFn: function() {
        return this.type === 'label' ? '#02A8F3' : 'currentColor';
      }
    },
    {
      model_: 'FloatProperty',
      name: 'alpha',
      defaultValue: 1,
    },
    {
      model_: 'foam.ui.ColorProperty',
      name: 'color_',
      dynamicValue: function() {
        if ( ! (this.action && this.data &&
            this.action.isEnabled.call(this.data)) )
          return this.setColor('rgba(0,0,0,0.65)');
        else
          return this.setColor(this.color);
      },
    },
  ],

  constants: {
    TYPE_CLASSES: {
      label: 'label-only',
      icon: 'icon-only',
      floating: 'floating-action-button'
    }
  },

  methods: [
    function initE() {
      this.cls(this.myCls())
          .style({
            color: this.color_$,
            opacity: this.alpha$,
          })
          .cls(function() {
            return this.action &&
                this.action.isAvailable.call(this.data, this.action) ?
                this.myCls('available') : '';
          })
          .cls(this.myCls(this.TYPE_CLASSES[this.type]))
          .cls('noselect')
          .on('click', this.onClick)
          // TODO(markdittmer): We need a better story for adapting CViews into
          // u2.
          .add(this.halo.toView_());

      if (this.type === 'label') {
        this.start('span').cls(this.myCls('label'))
            .add(function() {
              return this.action ? this.action.label : '';
            }.bind(this).on$(this.X, this.action$))
            .end();
      } else {
        this.start().cls(this.myCls('icon-container'))
            .start().cls(this.myCls('icon'))
                .add(this.icon)
                .end()
            .end();
      }
    },
    function setColor(c) {
      if ( ! this.Color.isInstance(c) ) {
        this.alpha = 1;
        return c;
      }
      this.alpha = c.alpha;
      c.alpha = 1;
      return c;
    }
  ],

  listeners: [
    function onClick(e) {
      e.preventDefault();
      e.stopPropagation();
      this.action.maybeCall(this.X, this.data);
    }
  ],

  templates: [
    function CSS() {/*
      $ {
        align-items: baseline;
        border-radius: 2px;
        color: #02A8F3;
        cursor: pointer;
        display: none;
        justify-content: center;
        margin: 8px;
        overflow: hidden;
        padding: 8px;
        position: relative;
      }

      $-available {
        display: inline-flex;
      }

      $-icon-only {
        border-radius: 50%;
        flex-shrink: 0;
        transform: unset;
        transition-delay: 249ms, 0ms, 0ms, 0ms;
        transition: transform 250ms ease, width 249ms ease, margin 249ms ease, padding 249ms ease;
        width: 40px;
      }

      $ .halo {
        border-radius: inherit;
        left: 0;
        position: absolute;
        top: 0;
        z-index: 2;
      }

      $-label-only $-label {
        color: inherit;
        text-transform: uppercase;
      }

      $-icon-container {
        height: 24px;
        position: relative;
        width: 24px;
      }
      $-icon {
        position: absolute;
        left: 0px;
      }

      $-floating-action-button {
        height: 44px;
        padding: 10px;
        width: 44px;
      }
    */}
  ]
});
