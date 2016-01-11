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
  name: 'GenerateContactProfiles',

  documentation: function() {/*
    Execution class for generating contact profiles. Invokes
    com.google.ymp.generators.ContactProfileGenerator.
  */},

  requires: [
    'com.google.ymp.generators.ContactProfileGenerator',
  ],
  imports: ['console'],

  methods: [
    function execute() {
      var generator = this.ContactProfileGenerator.create();
      var numContacts = 2000;
      var contacts = new Array(numContacts);
      var par = new Array(numContacts);

      for ( var i = 0; i < numContacts; ++i ) {
        par[i] = function(i, ret) {
          generator.generate(function(person) {
            contacts[i] = person;
            ret(contacts);
          });
        }.bind(this, i);
      }

      apar.apply(null, par)(function() {
        this.console.log(JSONUtil.stringify(contacts));
      }.bind(this));
    },
  ],
});
