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
  package: 'com.google.ymp.test',
  name: 'PostContent',

  documentation: 'Query/result pair for generating post content.',

  ids: [ 'query' ],

  properties: [
    {
      type: 'String',
      name: 'query',
    },
    {
      name: 'result',
    },
  ],
});
