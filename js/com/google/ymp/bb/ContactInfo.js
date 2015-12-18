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
  package: 'com.google.ymp.bb',
  name: 'ContactInfo',
  extends: 'com.google.ymp.GuidIDBase',
  traits: [ 'foam.core.dao.SyncTrait' ],

  constants: {
    CONTACT_TYPES: {
      other: 'other',
      bbm: 'bbm',
      email: 'email',
      facebook: 'facebook',
      googleplus: 'gplus',
      phone: 'phone',
      twitter: 'twitter',
      whatsapp: 'whatsapp',
    },
  },

  properties: [
    {
      type: 'String',
      name: 'contactType',
    },
    {
      type: 'String',
      name: 'value',
    },
  ],
});
