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
  ],
  imports: [
    'console',
    'exportDAO',
    'setInterval',
  ],

  properties: [
    {
      name: 'bbDAO',
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
  ],

  methods: [
    function execute() {
      this.console.log('Executing instance of', this.model_.id);
      this.exportDAO(this.bbDAO);
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
