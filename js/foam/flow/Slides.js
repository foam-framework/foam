/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

CLASS({
  package: 'foam.flow',
  name: 'Slides',
  extendsModel: 'foam.flow.Element',

  requires: [
    'foam.flow.Grid'
  ],

  properties: [
    {
      name: 'slides',
      singular: 'slide',
      factory: function() { return []; }
    },
    {
      name: 'currentSlide',
      getter: function() { return this.slides[this.position-1]; },
      transient: true
    },
    {
      model_: 'IntProperty',
      name: 'position',
      displayWidth: 5,
      defaultValue: 1,
      preSet: function(o, n) {
        return Math.max(1, Math.min(n, this.slides.length));
      },
      postSet: function(_, p) {
        if ( this.$ ) this.setView(this.currentSlide());
      }
    }
  ],

  methods: {
    initHTML: function() {
      this.SUPER();
      this.position = 1;
    },
    fromElement: function(e) {
      var slides = [];
      for ( var i = 0 ; i < e.children.length ; i++ )
        if ( e.children[i].nodeName === 'slide' )
          slides.push(ViewFactoryProperty.ADAPT.defaultValue(null, e.children[i].innerHTML));
      this.slides = slides;
    },
    setView: function(v) {
      this.currentView_ && this.currentView_.destroy && this.currentView_.destroy();
      this.currentView_ = v;
      this.$.querySelector('deck').innerHTML = v.toHTML();
      v.initHTML();
    }
  },

  actions: [
    {
      name: 'back',
      label: '<',
      isEnabled: function() { return this.position > 1; },
      action: function() {
        this.position--;
      }
    },
    {
      name: 'forth',
      label: '>',
      isEnabled: function() { return this.position < this.slides.length; },
      action: function() {
        this.position++;
      }
    },
    {
      name: 'legend',
      label: '[+]',
      action: function() { this.setView(this.Grid.create({cards: this.slides})); }
    }
  ],

  templates: [
    function CSS() {/*
      .card-grid {
        zoom: 0.2;
        margin-top: 60px;
      }
      slides .card-grid .card {
        width: 18%;
        height: 18%;
        overflow: hidden;
        box-shadow: 0 5px 15px #aaa;
        padding: 2px;
      }
      slides * {
        box-sizing: border-box;
      }
      slides, slides > deck, slides > controls {
        display: block;
      }
      slides > deck {
        width: 100%;
        flex-grow: 1;
        border: 1px solid black;
        overflow: auto;
        border: 1px solid gray;
      }
      slides > controls {
        width: 100%;
        height: 48px;
        border: 1px solid black;
        padding: 10px;
      }
      slides > controls input {
        vertical-align: top;
        width: 40px;
      }
      slides > controls .actionButton-back {
        margin-left: 100px;
      }
    */},
    function toInnerHTML() {/*
      <deck></deck>
      <controls>
        $$position of {{this.slides.length}} $$back $$forth $$legend
      </controls>
    */}
  ]
});
