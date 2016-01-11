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
  name: 'StreamableTrait',

  properties: [
    {
      type: 'String',
      name: 'id',
    },
    {
      type: 'String',
      name: 'sid',
      help: 'The sub-stream this envelope is inside of.',
      defaultValue: '',
    },
    {
      type: 'StringArray',
      name: 'substreams',
      help: 'The sids of sub-streams owned by the content of this envelope.',
    },

  ],
});
