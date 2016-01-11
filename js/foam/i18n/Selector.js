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
  name: 'Selector',
  package: 'foam.i18n',


  properties: [
    {
      type: 'String',
      name: 'name'
    },
    {
      type: 'Array',
      name: 'values',
      lazyFactory: function() { return {}; }
    }
  ],

  methods: [
    {
      name: 'validate',
      code: function() {
        if ( ! (this.values && this.values.other) )
          return 'Missing "other" key';

        return false;
      }
    }
  ]
});
