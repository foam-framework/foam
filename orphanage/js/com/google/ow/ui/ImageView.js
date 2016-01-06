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
  package: 'com.google.ow.ui',
  name: 'ImageView',
  extends: 'foam.u2.View',

  imports: [ 'dynamic' ],

  properties: [ [ 'nodeName', 'IMG' ] ],

  methods: [
    function initE() {
      return this.attrs({
        // TODO(markdittmer): This should be on this.data change and
        // this.data.dataUrl change. Support for nested dependencies in u2 still
        // in the works.
        src: this.dynamic(function() {
          return this.data ? this.data.dataUrl : '';
        }.bind(this), this.data$),
      });
    },
  ],
});
