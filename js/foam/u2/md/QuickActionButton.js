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
  name: 'QuickActionButton',
  extends: 'foam.u2.View',

  requires: [
    'foam.ui.Color',
    'foam.ui.Icon',
    'foam.ui.LigatureView',
    'foam.ui.md.HaloView',
  ],
  imports: [ 'window' ],

  properties: [
    [ 'nodeName', 'QUICK-ACTION-BUTTON' ],
    {
      type: 'Action',
      name: 'action',
    },
    {
      type: 'String',
      name: 'iconUrl',
      defaultValueFn: function() {
        return this.action ? this.action.iconUrl : '';
      },
    },
    {
      type: 'String',
      name: 'ligature',
      defaultValueFn: function() {
        return this.action ? this.action.ligature : '';
      },
    },
    {
      name: 'icon',
      lazyFactory: function() {
        // return this.Icon.create({
//           url$: this.iconUrl$,
//           ligature$: this.ligature$,
//           color$: this.color_$
//         }, this.Y);
          return this.LigatureView.create({
                data$: this.ligature$,
                color: 'currentColor',
                fontSize: 24,
                className: 'material-icons-extended',
              }, this.Y);
      },
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
      type: 'Float',
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
      // TODO(markdittmer): "icon-only" styles should be refactored/removed.
      return this.cls('md-button').cls('icon-only').style({
        color: this.color_$,
        opacity: this.alpha$,
      })
        .on('click', this.onClick)
          // TODO(markdittmer): We need a better story for adapting CViews into
          // u2.
          .add(this.halo.toView_())
          .start('div').cls('qab-icon-container')
            .start('div').cls('qab-icon')
              .add(this.icon)
            .end()
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
    function onClick(e) {
      e.preventDefault();
      e.stopPropagation();
      this.action.maybeCall(this.X, this.data);
    },
  ],

  templates: [
    function CSS() {/*
      quick-action-button {
        display: inline-flex;
        align-items: baseline;
        justify-content: center;
        overflow: hidden;
        position: relative;
        border-radius: 2px;
        cursor: pointer;
        color: #02A8F3;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        flex-shrink: 0;
      }

      quick-action-button .halo {
        position: absolute;
        left: 0;
        top: 0;
        z-index: 2;
        border-radius: inherit;
      }
    */},
  ],
});
