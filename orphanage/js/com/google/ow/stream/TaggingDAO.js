
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
  package: 'com.google.ow.stream',
  name: 'TaggingDAO',

  properties: [
    {
      type: 'String',
      name: 'tag',
      lazyFactory: function() { return createGUID(); },
    },
  ],

  methods: [
    function put(env, sink) {
      env.tags = env.tags.slice();
      env.tags.push(this.tag);
      this.delegate.push(env, sink);
    },
  ],
});
