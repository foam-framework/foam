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
  name: 'ImportExportFlow',

  imports: [
    'appBuilderAnalyticsEnabled$ as analyticsEnabled$',
    'mdToolbar as toolbar',
  ],
  properties: [
    'dao',
    'toolbar',
    {
      name: 'config',
      defaultValue: null,
      postSet: function(old, nu) {
        if ( old ) Events.unfollow(this.analyticsEnabled$,
                                   old.appBuilderAnalyticsEnabled$);
        if ( nu ) Events.follow(this.analyticsEnabled$,
                                nu.appBuilderAnalyticsEnabled$);
      },
    },
    {
      type: 'String',
      name: 'title',
      defaultValue: 'Exporting App',
    },
    {
      type: 'String',
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
        ['IMPORTING', 'Importing'],
        ['PUBLISHING', 'Publishing'],
        ['FAILED', 'Failed'],
        ['COMPLETED', 'Completed'],
      ],
    },
    {
      type: 'String',
      name: 'message',
    },
    {
      type: 'String',
      name: 'details',
      defaultValue: 'Still working...',
    },
  ],
});
