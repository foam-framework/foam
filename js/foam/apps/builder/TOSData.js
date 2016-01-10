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
  package: 'foam.apps.builder',
  name: 'TOSData',

  properties: [
    {
      type: 'String',
      name: 'tos',
      label: 'Terms of Service',
    },
    {
      type: 'Boolean',
      name: 'accepted',
      label: 'I accept these Terms of Service',
    },
  ],
});
