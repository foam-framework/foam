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
  package: 'foam.fonts',
  name: 'LigatureTester',

  requires: [
    'foam.ui.LigatureView',
  ],
  imports: [
    'window',
    'document'
  ],

  properties: [
    {
      name: 'ligature',
      defaultValue: 'accessibility',
      postSet: function(old, nu) {
        if ( old === nu || ! this.ligatureView ) return;
        this.ligatureView.data = nu;
      },
    },
    {
      type: 'Int',
      name: 'expectedWidth',
      defaultValue: 24,
      required: true,
    },
    {
      type: 'Int',
      name: 'expectedHeight',
      defaultValue: 24,
      required: true,
    },
    {
      type: 'Int',
      name: 'timeout',
      units: 'ms',
      defaultValue: 1000,
    },
    {
      name: '$parent',
      lazyFactory: function() {
        return this.document.createElement('div');
      },
      postSet: function(old, nu) {
        if ( old === nu ) return;
        if ( old ) {
          this.document.body.removeChild(old);
          old.removeEventListener('scroll', this.onParentScroll);
        }
        if ( nu ) {
          this.initParentStyle();
          this.document.body.appendChild(nu);
          nu.addEventListener('scroll', this.onParentScroll);
        }
      },
    },
    {
      name: 'parentStyle',
      factory: function() {
        return {
          position: 'fixed',
          bottom: '0',
          right: '0',
          visibility: 'hidden',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
          'z-index': '-1000',
        };
      },
      postSet: function(old, nu) {
        if ( old === nu || ! this.$parent ) return;
        this.initParentStyle();
      },
    },
    {
      type: 'ViewFactory',
      name: 'ligatureViewFactory',
      defaultValue: 'foam.ui.LigatureView',
    },
    {
      name: 'ligatureView',
      factory: function() {
        return this.ligatureViewFactory({
          data$: this.ligature$,
        });
      },
      postSet: function(old, nu) {
        if ( old === nu || ! nu ) return;
        var out = TemplateOutput.create(nu);
        nu.toHTML(out);
        this.$parent.innerHTML = out.toString();
        nu.initHTML();
        this.$parent.scrollTop = this.$parent.scrollHeight -
            this.$parent.clientHeight;
      },
    },
    {
      name: 'ligatureViewFuture',
      lazyFactory: function() {
        return this.ligatureViewFuture_.get;
      },
    },
    {
      name: 'ligatureViewFuture_',
      lazyFactory: function() {
        return afuture();
      },
    },
    {
      type: 'Int',
      name: 'timeoutID',
    },
  ],

  methods: [
    function init() {
      this.SUPER();
      this.timeoutID = this.window.setTimeout(function() {
        this.ligatureViewFuture_.set(null);
        this.ligatureView = this.$parent = null;
      }.bind(this), this.timeout);
    },
    function initParentStyle() {
      var parent = this.$parent;
      Object_forEach(this.parentStyle, function(value, key) {
        parent.style[key] = value;
      });
    },
  ],

  listeners: [
    {
      name: 'onParentScroll',
      code: function() {
        if ( ( ! this.ligatureView ) ||
            ( ! this.ligatureView.$ ) ||
            this.ligatureView.width !== this.expectedWidth ||
            this.ligatureView.height !== this.expectedHeight ) return;
        this.window.clearTimeout(this.timeoutID);
        this.ligatureViewFuture_.set(this.ligatureView);
        this.ligatureView = this.$parent = null;
      },
    },
  ],
});
