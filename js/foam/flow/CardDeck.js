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
  name: 'CardDeck',
  extendsModel: 'foam.flow.Element',

  properties: [
    {
      name: 'cards',
      singular: 'card',
      factory: function() { return []; }
    },
    {
      name: 'className',
      defaultValue: 'card-deck'
    }
  ],

  methods: {
    fromElement: function(e) {
      var cards = [];
      for ( var i = 0 ; i < e.children.length ; i++ )
        if ( e.children[i].nodeName === 'card' )
          cards.push(ViewFactoryProperty.ADAPT.defaultValue(null, e.children[i].innerHTML));
      this.cards = cards;
    },
    initHTML: function() {
      this.SUPER();
      var cols = {};
      for ( var i = 0 ; i < this.children.length; i++ ) {
        var outer = this.children[i].$;
        var inner = outer.children[0];
        var oBounds = outer.getBoundingClientRect();
        var iBounds = inner.getBoundingClientRect();
        var colInfo = cols[oBounds.left] || ( cols[oBounds.left] = 0 );

        outer.style.marginTop = -colInfo+16;
        cols[oBounds.left] = colInfo + oBounds.height - iBounds.height;
      }
    }
  },

  templates: [
    function CSS() {/*
    .card-deck {
      display: flex;
      flex-wrap: wrap;
      padding: 10px;
    }

    .card-deck .card {
      animation: fly-in-from-left .5s 1s ease both;
      background: white;
      border-radius: 3px;
      box-shadow: 0 1px 3px #aaa;
      margin: 0 1rem 1rem;
      min-width: 300px;
      padding: 1.5rem;
      transform-origin: top left;
    }
    */},
    function toInnerHTML() {/*
      <% for ( var i = 0 ; i < this.cards.length ; i++ ) {
        var v = this.cards[i](); %>
        <div id="{{v.id}}" class="outer">
          <div class="card">
            <%= v %>
          </div>
        </div>
      <% } %>
    */}
  ]
});
