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
  package: 'com.google.ow.ui',
  name: 'MenuView',
  extends: 'foam.u2.View',

  requires: [
    'foam.u2.DAOListView',
    'com.google.plus.ui.PersonCitationView',
  ],
  imports: [
    'currentUser$'
  ],
  exports: [
    'currentUser$ as selection$',
  ],

  constants: {
    MENU_CLOSE: ['menu-close']
  },

  properties: [
    [ 'nodeName', 'MENU' ],
    'currentUser'
  ],

  methods: [
    function initE() {
      var pY = this.Y.sub();
      pY.registerModel(this.PersonCitationView, 'foam.u2.DetailView');
      var users = this.DAOListView.create({
        data: this.data.personDAO
      }, pY);

      users.subscribe(users.ROW_CLICK, function() {
        this.publish(this.MENU_CLOSE);
      }.bind(this));

      return this.start('div').cls('md-headline').add('Select user').end()
          .start('div').cls('md-body').add(users).end();
    }
  ]
});
