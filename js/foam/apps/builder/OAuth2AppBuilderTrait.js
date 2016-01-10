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
  name: 'OAuth2AppBuilderTrait',

  properties: [
    {
      name: 'clientId',
      defaultValue: '60690598554-bobml1ka0vvpottq5bjt03iufa1p6s81.apps.googleusercontent.com',
    },
    {
      name: 'clientSecret',
      defaultValue: 'fonmdsOzNBG3Hnc2m-rrvgoY',
    },
    {
      type: 'StringArray',
      name: 'scopes',
      lazyFactory: function() {
        return [
          'email',
          'profile',
          'https://www.googleapis.com/auth/chromewebstore',
          'https://www.googleapis.com/auth/drive.appfolder',
        ];
      },
    },
  ],
});
