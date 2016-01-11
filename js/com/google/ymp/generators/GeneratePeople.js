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
  package: 'com.google.ymp.generators',
  name: 'GeneratePeople',

  requires: [
    'com.google.ymp.generators.PersonGenerator',
  ],
  imports: ['console'],

  methods: [
    function execute() {
      var generator = this.PersonGenerator.create();
      var numPeople = 2000;
      var people = new Array(numPeople);
      var par = new Array(numPeople);

      for ( var i = 0; i < numPeople; ++i ) {
        par[i] = function(i, ret) {
          generator.generate(function(person) {
            people[i] = person;
            ret(people);
          });
        }.bind(this, i);
      }

      apar.apply(null, par)(function() {
        this.console.log(JSONUtil.stringify(people));
      }.bind(this));
    },
  ],
});
