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
  package: 'com.google.ymp.ui',
  name: 'PersonChipView',
  extends: 'foam.u2.View',

  imports: [
//    'data',
    'personDAO',
  ],

  properties: [ 
    [ 'nodeName', 'PLUS-PERSON-CHIP' ],
    {
      name: 'personName',
    },
    {
      name: 'data',
      postSet: function(old,nu) {
        // look up the person id to find their name
        var self = this;
        self.personDAO = this.X.personDAO;
        self.personDAO.find(nu, {
          put: function(person) {
            self.personName = person.name;
          }
        });
      }
    }
  ],

  templates: [
    function initE() {/*#U2
      <div class="^">{{ this.personName$ }}</div>
    */},
    function CSS() {/*
      ^ {
        display: inline;
      }
    */}
  ]
});
