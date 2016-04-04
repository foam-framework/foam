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
    'foam.u2.Icon',
    'foam.u2.md.Tooltip',
    'foam.ui.Color',
    'foam.ui.md.HaloView',
  ],
  imports: [
    'dynamic',
    'framed',
    'window'
  ],

  constants: {
    TYPE_CLASSES: {
      label: 'label-only',
      icon: 'icon-only',
      both: 'both',
      floating: 'floating-action-button'
    }
  },

  properties: [
    [ 'nodeName', 'ACTION-BUTTON' ],
    'action',
    {
      name: 'type',
      choices: ['label', 'icon', 'both', 'floating'],
      defaultValueFn: function() {
        return this.action.ligature || this.action.iconUrl ? 'icon' : 'label';
      }
    },
    {
      name: 'halo',
      lazyFactory: function() {
        var halo = this.HaloView.create({
          className: 'halo',
          color: this.color_,
          recentering: false,
          pressedAlpha: 0.2,
          startAlpha: 0.2,
          finishAlpha: 0
        }, this.Y);
        this.color_$.addListener(this.framed(function(_, __, ___, c) {
          halo.color = c;
        }));
        return halo;
      }
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
      type: 'Float',
      name: 'alpha',
      defaultValue: 1
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
      }
    },
    {
      name: 'available_',
    },
  ],

  methods: [
    function initE() {
      var self = this;

      this.on('unload', this.X.dynamicFn(
          this.action.isAvailable.bind(this.data, this.action),
          function() {
            self.available_ = self.action.isAvailable.call(self.data, self.action);
          }
      ).destroy);

      this.cls(this.myCls())
          .style({
            color: this.color_$,
            opacity: this.alpha$,
          })
          .enableCls(this.myCls('available'), this.available_$)
          .cls(this.myCls(this.TYPE_CLASSES[this.type]))
          .cls('noselect')
          .on('click', this.onClick)
          // TODO(markdittmer): We need a better story for adapting CViews into
          // u2.
          .add(this.halo.toView_());

      if (this.type !== 'label') {
        this.start().cls(this.myCls('icon-container'))
        .start().cls(this.myCls('icon'))
            .add(this.icon)
            .end()
        .end();
      }
      if (this.type === 'label' || this.type === 'both') {
        this.start('span').cls(this.myCls('label'))
        .add(this.dynamic(function(action) {
          return action ? action.label : '';
        }, this.action$))
        .end();
      }

      if (this.action.help) {
        var tooltip;
        this.on('mouseenter', function() {
          tooltip = this.Tooltip.create({ text: this.action.help, target: this });
        }.bind(this));
        this.on('mouseleave', function() {
          tooltip && tooltip.close();
          tooltip = null;
        });
        this.on('unload', function() {
          tooltip && tooltip.remove();
          tooltip = null;
        });
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
      ^ {
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

      ^available {
        display: inline-flex;
      }

      ^icon-only {
        border-radius: 50%;
        flex-shrink: 0;
        transform: unset;
        transition-delay: 249ms, 0ms, 0ms, 0ms;
        transition: transform 250ms ease, width 249ms ease, margin 249ms ease, padding 249ms ease;
        width: 40px;
      }

      ^both {
        flex-shrink: 0;
        transform: unset;
        transition-delay: 249ms, 0ms, 0ms, 0ms;
        transition: transform 250ms ease, width 249ms ease, margin 249ms ease, padding 249ms ease;
        color: inherit;
        text-transform: uppercase;
        align-items: center;
      }

      ^ .halo {
        border-radius: inherit;
        left: 0;
        position: absolute;
        top: 0;
        z-index: 2;
      }

      ^label-only ^label {
        color: inherit;
        text-transform: uppercase;
      }

      ^icon-container {
        height: 24px;
        position: relative;
        width: 24px;
      }
      ^both ^icon-container {
        margin-right: 15px;
      }
      ^icon {
        position: absolute;
        left: 0px;
      }

      ^floating-action-button {
        background-color: #e51c23;
        border-radius: 50%;
        bottom: 10px;
        box-shadow: 3px 3px 3px rgba(0, 0, 0, 0.33);
        flex-shrink: 0;
        height: 44px;
        margin: 0;
        opacity: 1;
        padding: 10px;
        position: absolute;
        right: 20px;
        width: 44px;
        z-index: 10;
      }
    */}
  ]
});
