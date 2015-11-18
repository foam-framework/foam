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
  package: 'com.google.ow.content',
  name: 'UpdateStream',
  extends: 'com.google.ow.content.Stream',

  properties: [
    {
      model_: 'StringProperty',
      name: 'titleText',
      defaultValue: 'Your order',
    },
  ],

  methods: [
    function put(envelope, sink) {},
    function toDetailE(X) {
      return X.lookup('com.google.ow.ui.UpdateStreamDetailView').create({ data: this }, X);
    },
    function toCitationE(X) {
      return X.lookup('com.google.ow.ui.UpdateStreamCitationView').create({ data: this }, X);
    },
  ],
});
