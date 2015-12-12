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
  package: 'com.google.ymp',
  name: 'Client',

  requires: [
    'foam.dao.EasyDAO',
    'com.google.ymp.bb.Post',
    'foam.ui.DAOListView',
  ],

  properties: [
    {
      name: 'postDAO',
      view: 'foam.ui.DAOListView',
      lazyFactory: function() {
        return this.EasyDAO.create({
          model: this.Post,
          name: 'posts',
          caching: true,
          syncWithServer: true,
          sockets: true,
        });
      },
    },
  ],

});
