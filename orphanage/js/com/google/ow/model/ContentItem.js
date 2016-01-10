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
  package: 'com.google.ow.models',
  name: 'ContentItem',

  documentation: function() {/* Holds a piece of large content, retrieved
    from an ordinary URL. Allows large content to be pulled at a later
    time, and cached locally for as long as needed.
    TODO: add toE() or toPreviewE?  */},

  properties: [
    {
      type: 'String',
      name: 'id',
    },
    {
      type: 'String',
      name: 'hash',
      defaultValue: '',
    },
    {
      type: 'URL',
      name: 'url',
    },
    {
      type: 'Int',
      name: 'bytes',
    }
  ],
});
