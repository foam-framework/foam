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
  package: 'com.google.ow',
  name: 'IdGenerator',

  properties: [
    {
      name: 'testNames',
      lazyFactory: function() {
        return [
          ['Henry', 'Joe', 'Carvil'],
          ['Sammy', 'Davis', 'Junior'],
          ['Herbert', '', 'Hoover'],
          ['Jerry', '', 'Seinfeld'],
          ['Samwise', '', 'Gamgee'],
          ['Norman', 'J', 'Bates'],
          ['Doctor', '', 'Who'],
          ['Charleton', '', 'Heston'],
        ];
      },
    },
  ],

  methods: [
    function fromName(nameParts) {
      return nameParts.join('$').hashCode().toString();
    },
  ],
});
