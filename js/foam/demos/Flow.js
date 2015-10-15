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
  package: 'foam.demos',
  name: 'Flow',
  extends: 'foam.flow.Section',

  constants: { ELEMENT_NAME: 'foam-demos-flow' },

  requires: [
    'foam.flow.ToC',
    'foam.graphics.Circle',
    'foam.flow.CodeSample',
    'foam.flow.Slides'
  ],

  methods: {
    init: function() {
      this.SUPER.apply(this, arguments);
      this.X.registerElement('circle', 'foam.graphics.Circle');

      this.Slides.getProperty('installCSS').documentInstallFn.call(
        this.Slides.getPrototype(), this.X);
      this.Slides.getProperty('registerElement').documentInstallFn.call(
        this.Slides.getPrototype(), this.X);
    }
  },

  templates: [
    function CSS() {/*
      .flow-slides-slide {
        width: 500px;
        height: 300px;
      }
    */},
    { name: 'toHTML' }
  ]
});
