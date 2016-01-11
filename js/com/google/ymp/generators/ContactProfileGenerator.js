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
  name: 'ContactProfileGenerator',
  extends: 'com.google.ymp.generators.Generator',

  requires: [
    'com.google.ymp.bb.ContactProfile',
  ],

  properties: [
    {
      type: 'StringArray',
      name: 'prefixes',
      lazyFactory: function() {
        return [
          'Tiny',
          'Cute',
          'Big',
          'Mini',
          'Pico',
          'Happy',
          'Sweet',
          'Super',
          'Mr',
          'Miss',
          'Missy',
          'Sunny',
          'TheBoss',
          'Madame',
          'Prince',
          'Princess',
        ];
      },
    },
    {
      type: 'StringArray',
      name: 'names',
      lazyFactory: function() {
        return [
          'Unicorn',
          'Kitten',
          'Bear',
          'Narwhal',
          'Walrus',
          'Pup',
          'Chiuaua',
          'Tank',
          'Otter',
          'Dragon',
          'Tiger',
          'Mongoose',
          'Meercat',
          'Skunk',
        ];
      },
    },
  ],

  methods: [
    function generate(ret) {
      var cp = this.ContactProfile.create();
      cp.id = createGUID();
      var parts = [this.randArrElem(this.prefixes),
                   this.randArrElem(this.names)];
      var f = function(method, ret) {
        if ( Math.random() > 0.5 ) {
          method(ret, cp, parts);
        } else {
          ret(cp);
        }
      };
      apar(
          f.bind(this, this.getTwitter.bind(this)),
          f.bind(this, this.getEmail.bind(this)),
          f.bind(this, this.getPhone.bind(this)))(function() {
            if ( cp.contactDetails.length === 0 )
              this.getPhone(ret, cp);
            else
              ret(cp);
          }.bind(this));
    },

    function getTwitter(ret, cp, parts) {
      cp.contactDetails.push(
          '@' + parts[0] + parts[1] + Math.floor(Math.random() * 1000));
      ret(cp);
    },

    function getEmail(ret, cp, parts) {
      var sep = this.randArrElem(['_', '-', '.']);
      var domain = this.randArrElem([
        '@gmail.com',
        '@hotmail.com',
        '@live.com',
        '@outlook.com',
        '@facebook.com',
      ]);
      cp.contactDetails.push(parts[0].toLowerCase() + sep +
          parts[1].toLowerCase() + domain);
      ret(cp);
    },

    function getPhone(ret, cp) {
      cp.contactDetails.push(
          '+' + this.randRange(1, 100) + ' ' +
              this.randRange(200, 799) + ' ' +
              this.randRange(200, 799) + ' ' +
              this.randRange(1000, 9999));
      ret(cp);
    },
  ],
});
