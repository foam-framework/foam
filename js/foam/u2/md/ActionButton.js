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
      model_: 'foam.ui.ColorProperty',
      name: 'color',
      defaultValue: '#02A8F3',
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

  methods: [
    function initE() {
      return this.cls('md-button').style({
        color: this.color_$,
        opacity: this.alpha$,
      })
        .on('click', this.onClick)
          // TODO(markdittmer): We need a better story for adapting CViews into
          // u2.
          .add(this.halo.toView_())
          .start('span').cls('md-button-label')
            .add(function() {
              return this.action ? this.action.label : '';
            }.bind(this).on$(this.X, this.action$))
          .end();
    },
    function setColor(c) {
      if ( ! this.Color.isInstance(c) ) {
        this.alpha = 1;
        return c;
      }
      this.alpha = c.alpha;
      c.alpha = 1;
      return c;
    },
  ],

  listeners: [
    function onClick() {
      console.log('Action button click');
    },
  ],

  templates: [
    function CSS() {/*
      action-button {
        display: inline-flex;
        align-items: baseline;
        justify-content: center;
        overflow: hidden;
        position: relative;
        border-radius: 2px;
        cursor: pointer;
        color: #02A8F3;
      }

      action-button .halo {
        position: absolute;
        left: 0;
        top: 0;
        z-index: 2;
        border-radius: inherit;
      }

      action-button.md-button .md-button-label {
        color: inherit;
      }
    */},
  ],
});
