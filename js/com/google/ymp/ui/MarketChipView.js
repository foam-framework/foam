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
  name: 'MarketChipView',
  extends: 'foam.u2.View',

  imports: [
    'marketDAO',
  ],

  properties: [ 
    [ 'nodeName', 'PLUS-MARKET-CHIP' ],
    {
      name: 'marketName',
    },
    {
      name: 'data',
      postSet: function(old,nu) {
        // look up the market id to find its name
        var self = this;
        self.marketDAO = this.X.marketDAO;
        self.marketDAO.find(nu, {
          put: function(market) {
            self.marketName = market.name;
          }
        });
      }
    }
  ],

  templates: [
    function initE() {/*#U2
      <div class="^">{{ this.marketName$ }}</div>
    */},
    function CSS() {/*
      ^ {
        display: inline;
      }
    */}
  ]
});
