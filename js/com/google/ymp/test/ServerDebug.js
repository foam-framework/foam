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
  package: 'com.google.ymp.test',
  name: 'ServerDebug',

  requires: [
    'com.google.ymp.generators.PersonLocationGenerator',
    'com.google.ymp.geo.Finder',
  ],
  imports: [
    'console',
    'marketDAO_',
  ],

  methods: [
    function execute() {
      /* Use this method to run debugging code after data is loaded in
         YMp Server. */
    },
  ],
});
