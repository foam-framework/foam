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
  extendsModel: 'View',

  properties: [
    {
      name: 'slides',
      singular: 'slide',
      factory: function() { return []; },
      fromElement: function(e) {
        this.slides.push(ViewFactoryProperty.ADAPT.defaultValue(null, e.innerHTML));
        return this;
      }
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
      postSet: function(_, p) {
        if ( ! this.$ ) return;
        var v = this.currentSlide();
        this.$.querySelector('.flow-slides-slide').innerHTML = v.toHTML();
        v.initHTML();
      }
    },
    {
      name: 'className',
      defaultValue: 'flow-slides'
    }
  ],

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
      .flow-slides {
        border: 1px solid black;
      }
      .flow-slides-slide {
        border: 1px solid black;
      }
      .flow-slides-controls {
        xxxborder: 1px solid black;
        padding: 10px;
      }
    */},
    function toInnerHTML() {/*
      <div class="flow-slides-slide">
        <%= this.currentSlide() %>
      </div>
      <div class="flow-slides-controls">
        $$back $$forth   $$position{dispalyWidth: 5} of {{this.slides.length}}
      </div>
    */}
  ]
});
