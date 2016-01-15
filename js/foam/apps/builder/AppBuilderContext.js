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
  name: 'AppBuilderContext',

  requires: [
    'foam.apps.builder.Identity',
  ],

  properties: [
    {
      name: 'identity',
      lazyFactory: function() {
        return DEBUG ? (
          this.Identity.create({
            id: 'fakeID1234',
            displayName: 'User Q User',
            oauth: '',
            iconUrl: '',
            authType: 'WEB',
          })
        ) : null;
      },

    },
    {
      type: 'Array',
      subType: 'foam.apps.builder.Identity',
      name: 'identities',
      lazyFactory: function() { return []; },
    },
    {
      type: 'Boolean',
      name: 'hasSeenDesignerView',
      defaultValue: false,
      hidden: true,
    },
    {
      type: 'Boolean',
      name: 'appBuilderAnalyticsEnabled',
      label: 'Send anonymous usage data from my apps to the App Builder team ' +
          'to help make App Builder better<br><a href="#">Learn more</a>',
      defaultValue: true,
    },
  ],
});
