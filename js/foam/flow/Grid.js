/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

/* EXPERIMENTAL */

CLASS({
  package: 'foam.flow',
  name: 'Grid',
  extends: 'foam.flow.Element',

  properties: [
    {
      name: 'cards',
      singular: 'card',
      factory: function() { return []; }
    },
    {
      name: 'className',
      defaultValue: 'card-grid'
    }
  ],

  methods: {
    fromElement: function(e) {
      var cards = [];
      for ( var i = 0 ; i < e.children.length ; i++ )
        if ( e.children[i].nodeName === 'card' )
          cards.push(ViewFactoryProperty.ADAPT.defaultValue(null, e.children[i].innerHTML));
      this.cards = cards;
    }
  },

  templates: [
    function CSS() {/*
    .card-grid {
      display: flex;
      flex-wrap: wrap;
      padding: 10px;
    }

    .card-grid .card {
      animation: fly-in-from-left .5s 1s ease both;
      background: white;
      border-radius: 3px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.38);
      margin: 0 1rem 1rem;
      min-width: 300px;
      padding: 1.5rem;
      transform-origin: top left;
    }
    */},
    function toInnerHTML() {/*
      <% for ( var i = 0 ; i < this.cards.length ; i++ ) { %>
        <div class="card"><div class="card-inset">
          <%= this.cards[i]() %>
        </div></div>
      <% } %>
    */}
  ]
});
