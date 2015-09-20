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
  name: 'ExportFlow',

  imports: [
    'mdToolbar as toolbar',
  ],
  properties: [
    'config',
    'toolbar',
    {
      model_: 'StringProperty',
      name: 'title',
      defaultValue: 'Exporting App',
    },
    {
      model_: 'StringProperty',
      name: 'actionName',
      defaultValue: 'exportApp',
    },
    {
      model_: 'foam.core.types.StringEnumProperty',
      name: 'state',
      defaultValue: 'AUTHENTICATING',
      choices: [
        ['AUTHENTICATING', 'Authenticating'],
        ['UPLOADING', 'Uploading'],
        ['DOWNLOADING', 'Downloading'],
        ['PUBLISHING', 'Publishing'],
        ['FAILED', 'Failed'],
        ['COMPLETED', 'Completed'],
      ],
    },
    {
      model_: 'StringProperty',
      name: 'message',
    },
    {
      model_: 'StringProperty',
      name: 'details',
      defaultValue: 'Still working...',
    },
  ],
});
