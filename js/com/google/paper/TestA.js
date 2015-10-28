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
  package: 'com.google.paper',
  name: 'TestA',

  requires: [
    'com.nodeca.Pako',
  ],

  properties: [
    {
      name: 'pako',
      factory: function() {
        var p = this.Pako.create();
        return p.pako;
      }
    },
    {
      name: 'source',
      postSet: function(old, nu) {
        this.compressed = "bytes: " + nu.length +", compressed: " + this.pako.deflate(nu).length;
      }
    },
    {
      name: 'compressed',
    },
  ],


});
