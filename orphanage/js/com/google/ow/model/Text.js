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
  package: 'com.google.ow.model',
  name: 'Text',

  properties: [
    'id',
    {
      type: 'String',
      name: 'titleText',
      defaultValue: '...',
    },
    {
      type: 'String',
      name: 'message',
    },
  ],

  methods: [
    function toE(X) {
      return X.lookup('foam.u2.Element').create(null, X).add(this.message);
    },
    function toSummaryE(X) {
      return X.lookup('foam.u2.Element').create(null, X).add(this.message);
    },
    function toDetailE(X) {
      return X.lookup('foam.u2.Element').create(null, X).add(this.message);
    },
    function toCitationE(X) {
      return X.lookup('foam.u2.Element').create(null, X).add(this.message);
    },
  ],
});
