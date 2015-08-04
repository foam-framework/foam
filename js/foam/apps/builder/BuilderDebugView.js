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
  package: 'foam.apps.builder',
  name: 'BuilderDebugView',

  extendsModel: 'foam.ui.DetailView',

  requires: [
    'foam.apps.builder.Builder',
    'foam.apps.builder.BuilderView',
  ],

  properties: [
    {
      name: 'builder',
      lazyFactory: function() {
        return this.Builder.create();
      }
    },
    {
      name: 'builderView',
      lazyFactory: function() {
        return this.BuilderView.create({ data: this.builder }, this.builder.Y);
      }
    }
  ],

  methods: [
    function toHTML() {
      return this.builderView.toHTML();
    },
    function initHTML() {
      return this.builderView.initHTML();
    }
  ]

});
