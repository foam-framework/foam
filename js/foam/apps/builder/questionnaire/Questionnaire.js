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
  package: 'foam.apps.builder.questionnaire',
  name: 'Questionnaire',

  properties: [
    {
      name: 'id',
      help: 'The unique id for this record.',
      hidden: true,
    },
    {
      type: 'DateTime',
      name: 'modified',
      help: 'The last modified time of the record.',
      hidden: true,
    }
  ],

});
