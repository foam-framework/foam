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
  package: 'com.google.ow.content',
  name: 'CommentThreadTrait',

  documentation: function() {/* Adds a comment thread to your content type. TODO: Not done yet! */},

  requires: [
    'foam.u2.Element',
    'foam.ui.Icon',
    'com.google.ow.content.CommentThread',
  ],

  exports: [
    'this as data',
  ],

  imports: [
    'envelope', // used client-side
    'streamDAO',
  ],

  properties: [
    {
      name: 'comments',
      lazyFactory: function() {
        return this.CommentThread.create({ id: this.id+"comments" });
      }
    },
  ],

});
