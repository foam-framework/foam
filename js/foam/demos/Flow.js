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
  extendsModel: 'foam.flow.Section',

  properties: [
  ],

  methods: {
    init: function(args) {
      this.SUPER(args);
      this.X.registerElement('solar',       'foam.demos.SolarSystem');
      this.X.registerElement('circle',      'foam.graphics.Circle');
      this.X.registerElement('email',       'com.google.mail.MobileController');
      this.X.registerElement('toc',         'foam.flow.ToC');
      this.X.registerElement('section',     'foam.flow.Section');
      this.X.registerElement('code-sample', 'foam.flow.CodeSample');
      this.X.registerElement('slides',      'foam.flow.Slides');
    }
  },

  templates: [
    function CSS() {/*
      .flow-slides-slide {
        width: 500px;
        height: 300px;
      }
    */},
    {
      name: 'toHTML'
    }
  ]
});
