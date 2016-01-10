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
  package: 'foam.ui',
  name: 'SlidingCollectionView',
  extends: 'foam.ui.View',
  traits: ['foam.ui.layout.PositionedDOMViewTrait'],

  requires: [
    'foam.ui.layout.ViewSlider',
    'foam.ui.layout.FloatingView'
  ],

  properties: [
    {
      type: 'Array',
      name: 'arr',
      lazyFactory: function() { return []; }
    },
    {
      type: 'Int',
      name: 'realIdx',
      defaultValue: -1
    },
    {
      type: 'Int',
      name: 'uiIdx',
      defaultValue: -1
    },
    {
      type: 'Array',
      name: 'queuedListeners',
      lazyFactory: function() { return []; }
    },
    {
      name: 'slider',
      lazyFactory: function() {
        var slider = this.ViewSlider.create();
        Events.link(this.sliderView$, slider.view$);
        return slider;
      },
      postSet: function(old, nu) {
        if ( old ) Events.unlink(this.sliderView$, old.view$);
        if ( nu ) Events.link(this.sliderView$, nu.view$);
      }
    },
    {
      name: 'sliderView',
      postSet: function(old, nu) {
        this.onSliderDone(old, nu);
      }
    }
  ],

  methods: {
    init: function() {
      this.SUPER();
      var self = this;
      this.X.dynamicFn(function() { self.width; self.height; }, this.layout);
    },
    maybeWrapView: function(view) {
      return view.model_.Z ? view : this.FloatingView.create({ view: view });
    },
    pushView_: function(view) {
      view = this.maybeWrapView(view);
      this.arr.push(view);
      this.propertyChange('arr', this.arr, this.arr);
      return view;
    },
    popView_: function() {
      return this.arr.pop() || '';
    },
    transitionView: function(view, opt_transition) {
      if ( opt_transition === 'none' ) {
        this.slider.setView(view);
        return;
      }
      this.slider.reverse = opt_transition === 'fromLeft';
      this.slider.slideView(view);
    },
    resetViews: function(view) {
      for ( var i = 0; i < this.arr.length; ++i ) {
        this.arr[i].destroy();
      }
      this.arr = [];
      this.realIdx = 0;
      this.uiIdx = 0;
      this.transitionView(this.pushView_(view), 'none');
    },
    enqueueListener: function(listenerName) {
      this.queuedListeners.push(listenerName);
      if ( this.queuedListeners.length === 1 ) this.maybeDequeueListener();
    },
    maybeDequeueListener: function() {
      if ( this.queuedListeners.length === 0 ) return;
      var listenerName = this.queuedListeners.shift();
      this[listenerName]();
    },
    layout_: function() {
      this.slider.x = 0;
      this.slider.y = 0;
      this.slider.width = this.width;
      this.slider.height = this.height;
    }
  },

  listeners: [
    {
      name: 'layout',
      code: function() {
        this.layout_();
      }
    },
    {
      name: 'onBack',
      code: function() {
        if ( this.uiIdx > 0 ) {
          this.uiIdx--;
          this.transitionView(this.arr[this.uiIdx], 'fromLeft');
        }
      }
    },
    {
      name: 'onForth',
      code: function() {
        if ( this.uiIdx < this.arr.length - 1 ) {
          this.uiIdx++;
          this.transitionView(this.arr[this.uiIdx]);
        }
      }
    },
    {
      name: 'onSliderDone',
      code: function(old, nu) {
        this.maybeDequeueListener();
      }
    }
  ],

  templates: [
    function toInnerHTML() {/* %%slider */}
  ],

  actions: [
    {
      name:  'back',
      label: '<',
      help:  'Go to previous view',

      isEnabled: function() {
        return this.realIdx > 0;
      },
      code: function() {
        this.realIdx--;
        this.enqueueListener('onBack');
      }
    },
    {
      name:  'forth',
      label: '>',
      help:  'Go to next view.',
      isEnabled: function() {
        return this.realIdx < this.arr.length - 1;
      },
      code: function() {
        this.realIdx++;
        this.enqueueListener('onForth');
      }
    }
  ]
});
