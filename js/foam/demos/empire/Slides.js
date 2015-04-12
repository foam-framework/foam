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
  package: 'foam.demos.empire',
  name: 'Slides',
  extendsModel: 'foam.flow.Section',

  constants: { ELEMENT_NAME: 'foam-demos-flow' },

  requires: [
    'foam.graphics.Circle',
    'foam.flow.CodeSample',
    'foam.flow.Slides'
  ],

  methods: {
    init: function() {
      this.SUPER.apply(this, arguments);
      this.X.registerElement('circle', 'foam.graphics.Circle');
    }
  },

  templates: [
    function CSS() {/*
      deck {
        padding-left: 16px;
      }
      h1 {
        color: blue;
        font-size: 54px;
        margin-top: 16px;
        margin-bottom: 16px;
      }
    */},
    { name: 'toHTML' }
  ]
});
