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
  name: 'Ad',

  properties: [
    'id',
    'merchant',
    'adStream',
    {
      type: 'String',
      name: 'titleText',
      required: true,
    },
    {
      type: 'String',
      name: 'summaryText',
      required: true,
    },
    {
      type: 'String',
      name: 'imageUrl',
      toPropertyE: function(X) {
        // TODO(markdittmer): This should just be a (U2) ImageProperty.
        return X.E('img').attrs({ src: X.data[this.name + '$'], });
      },
    },
    {
      type: 'String',
      name: 'headerImageUrl',
      toPropertyE: function(X) {
        // TODO(markdittmer): This should just be a (U2) ImageProperty.
        return X.E('img').attrs({ src: X.data[this.name + '$'] });
      },
    },
  ],
});
