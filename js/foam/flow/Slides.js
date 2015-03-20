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
        if ( ! this.$ ) return;
        this.currentSlide_ && this.currentSlide_.destroy && this.currentSlide_.destroy();
        var v = this.currentSlide_ = this.currentSlide();
        this.$.querySelector('deck').innerHTML = v.toHTML();
        v.initHTML();
      }
    }
  ],

  methods: {
    fromElement: function(e) {
      var slides = [];
      for ( var i = 0 ; i < e.children.length ; i++ )
        if ( e.children[i].nodeName === 'slide' )
          slides.push(ViewFactoryProperty.ADAPT.defaultValue(null, e.children[i].innerHTML));
      this.slides = slides;
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
    }
  ],

  templates: [
    function CSS() {/*
      slides * {
        box-sizing: border-box;
      }
      slides, slides > deck, slides > controls {
        display: block;
      }
      slides > deck {
        width: 100%;
        height: 90%;
        border: 1px solid black;
        overflow: auto;
        border: 1px solid gray;
      }
      slides > controls {
        width: 100%;
        height: 10%;
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
      <deck>
        <%= this.currentSlide() %>
      </deck>
      <controls>
        $$position of {{this.slides.length}} $$back $$forth
      </controls>
    */}
  ]
});
