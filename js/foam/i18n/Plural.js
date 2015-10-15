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
  name: 'Plural',
  package: 'foam.i18n',
  extends: 'foam.i18n.Selector',

  methods: [
    {
      name: 'validate',
      code: function() {
        if ( ! (this.values && this.values.other) )
          return 'Missing "other" key';

        var keys = Object.keys(this.values);
        for ( var i = 0; i < keys.length; ++i ) {
          var key = keys[i];
          if ( ! key.match(/^=[0-9]+$/g) && key !== 'other' )
            return 'Malformed plural key "' + key + '"';
        }

        return false;
      }
    }
  ]
});
