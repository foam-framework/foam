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
    'com.google.ymp.bb.Reply',
    'com.google.ymp.DynamicImage',
    'com.google.plus.Person',
    'foam.ui.DAOListView',
  ],

  exports: [
    'postDAO',
    'replyDAO',
    'dynamicImageDAO',
    'personDAO',
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
    {
      name: 'replyDAO',
      view: 'foam.ui.DAOListView',
      lazyFactory: function() {
        return this.EasyDAO.create({
          model: this.Reply,
          name: 'replies',
          caching: true,
          syncWithServer: true,
          sockets: true,
        });
      },
    },
    {
      name: 'dynamicImageDAO',
      view: 'foam.ui.DAOListView',
      lazyFactory: function() {
        return this.EasyDAO.create({
          model: this.DynamicImage,
          name: 'dynamicImages',
          caching: true,
          syncWithServer: true,
          sockets: true,
        });
      },
    },
    {
      name: 'personDAO',
      view: 'foam.ui.DAOListView',
      lazyFactory: function() {
        return this.EasyDAO.create({
          model: this.Person,
          name: 'people',
          caching: true,
          syncWithServer: true,
          sockets: true,
        });
      },
    },
  ],

});
