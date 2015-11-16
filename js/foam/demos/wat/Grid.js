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
  package: 'foam.demos.wat',
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
      justify-content: center;
      padding: 10px;
    }

    @-webkit-keyframes outer-flyin {
       to {
         box-shadow: 0 5px 15px rgba(0, 0, 0, 0.38);
       }
    }

    @-webkit-keyframes inner-flyin {
       to {
         filter: blur(0);
         transform: scale(0.15);
         opacity: 1;
       }
    }

    .card-grid .grid-card {
      -webkit-animation: outer-flyin 0.5s 1s ease both;

      box-shadow: 0 15px 45px rgba(0, 0, 0, 0);

      background: white;
      border-radius: 3px;
      margin: 0 1rem 1rem;
      min-width: 300px;
      padding: 1.5rem;
      transform-origin: top left;
    }

    .card-grid .grid-card {
      margin: 0 12px 20px;
      overflow: hidden;
      padding: 2px;
      width: calc(100vw * 0.154);
      height: calc(100vh * 0.154);
      min-width: initial;
    }
    .card-grid .card-inset {
      -webkit-animation: inner-flyin .5s 1s ease both;

      opacity: 0;
      transform: scale(1);
      filter: blur(4px);

      overflow: hidden;
      position: absolute;
      transform-origin: 0 0;
      width: 100%;
      display: flex;
      align-items: stretch;
      align-content: space-around;
      justify-content: center;
      flex-direction: column;
      height: 101%;
    }
    */},
    function toInnerHTML() {/*
      <% for ( var i = 0 ; i < this.cards.length ; i++ ) { %>
        <div class="grid-card"><div class="card-inset">
          <%= this.cards[i]() %>
        </div></div>
      <% } %>
    */}
  ]
});
