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
  package: 'com.google.nbuEDU',
  name: 'UserClient',
  extends: 'com.google.ow.UserClient',

  properties: [
    {
      model_: 'FunctionProperty',
      name: 'clientFactory',
      defaultValue: function() {
        return this.Client.create({
          titleText: 'EDUConnect',
          backgroundColor: '#3B84D9',
          headerColor: '#3B84D9',
          currentUserId$: this.currentUserId$,
        });
      },
    },
  ],

});
