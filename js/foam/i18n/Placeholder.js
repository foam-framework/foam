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
  name: 'Placeholder',
  package: 'foam.i18n',

  properties: [
    {
      type: 'String',
      name: 'name',
      required: true
    },
    {
      type: 'String',
      name: 'example',
      required: true
    }
  ],

  methods: {
    validate: function() {
      if ( ! this.name ) return 'Missing name';
      if ( ! this.example ) return 'Missing example';
      return false;
    }
  }
});
