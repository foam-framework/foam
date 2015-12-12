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
  name: 'Server',

  requires: [
    'MDAO',
    'foam.dao.EasyDAO',
    'com.google.ymp.bb.Post',
    'com.google.ymp.bb.Reply',
    'com.google.ymp.DynamicImage',
    'com.google.plus.Person',
  ],
  imports: [
    'console',
    'exportDAO',
    'setInterval',
  ],

  properties: [
    {
      name: 'postDAO',
      lazyFactory: function() {
        return this.EasyDAO.create({
          model: this.Post,
          name: 'posts',
          daoType: this.MDAO,
          guid: true,
          sockets: true,
          isServer: true,
        });
      },
    },
    {
      name: 'replyDAO',
      lazyFactory: function() {
        return this.EasyDAO.create({
          model: this.Reply,
          name: 'replies',
          daoType: this.MDAO,
          guid: true,
          sockets: true,
          isServer: true,
        });
      },
    },
    {
      name: 'dynamicImageDAO',
      lazyFactory: function() {
        return this.EasyDAO.create({
          model: this.DynamicImage,
          name: 'dynamicImages',
          daoType: this.MDAO,
          guid: true,
          sockets: true,
          isServer: true,
        });
      },
    },
    {
      name: 'personDAO',
      lazyFactory: function() {
        return this.EasyDAO.create({
          model: this.Person,
          name: 'people',
          daoType: this.MDAO,
          guid: true,
          sockets: true,
          isServer: true,
        });
      },
    },
  ],

  methods: [
    function execute() {
      this.console.log('Executing instance of', this.model_.id);
      this.exportDAO(this.postDAO);
      this.exportDAO(this.replyDAO);
      this.exportDAO(this.dynamicImageDAO);
      this.exportDAO(this.personDAO);
      var inc = 0;
      this.setInterval(function() {
        this.bbDAO.put(this.Post.create({ 
          syncProperty: 0,
          guid: createGUID(),
          title: 'new thing' + inc++,
        }))
      }.bind(this), 4000);
    },
  ],
});
