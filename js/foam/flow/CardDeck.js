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
  extends: 'foam.flow.Element',

  properties: [
    {
      name: 'cards',
      singular: 'card',
      factory: function() { return []; }
    },
    {
      name: 'className',
      defaultValue: 'card-deck'
    },
    {
      name: 'minWidth',
      defaultValue: 500
    }
  ],

  methods: {
    fromElement: function(e) {
      this.SUPER(e);
      var cards = [];
      for ( var i = 0 ; i < e.children.length ; i++ )
        if ( e.children[i].nodeName === 'card' )
          cards.push(ViewFactoryProperty.ADAPT.defaultValue(null, e.children[i].innerHTML));
      this.cards = cards;
    },
    initHTML: function() {
      this.SUPER();
      this.X.window.addEventListener('resize', this.onResize);
      // TODO: Give time for layout.  This is pretty hacking and should be fixed.
      setTimeout(this.onResize, 200);
      setTimeout(this.onResize, 600);
    }
  },

  listeners: [
    {
      name: 'onResize',
      isFramed: true,
      code: function(e) {
        if ( ! this.$ ) return;
        var cols = {};
        for ( var i = 0 ; i < this.children.length; i++ ) {
          var outer   = this.children[i].$;
          var inner   = outer.children[0];
          var oBounds = outer.getBoundingClientRect();
          var iBounds = inner.getBoundingClientRect();
          var colInfo = cols[oBounds.left] || ( cols[oBounds.left] = 0 );

          var oldTop = toNum(outer.style.marginTop);
          oldTop = Number.isNaN(oldTop) ? 0 : oldTop;
          outer.style.marginTop = -colInfo;
          cols[oBounds.left] += oBounds.height - iBounds.height - 16 + oldTop;
        }
      }
    },
  ],

  templates: [
    function CSS() {/*
    .card-deck {
      display: flex;
      flex-wrap: wrap;
      padding: 10px;
    }

    .card-deck .card {
      xxxanimation: fly-in-from-left .5s 1s ease both;
      background: white;
      border-radius: 3px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.38);
      margin: 8px;
      transform-origin: top left;
    }
    */},

    function toInnerHTML() {/*
      <% for ( var i = 0 ; i < this.cards.length ; i++ ) {
        var v = this.cards[i](); %>
        <div id="{{v.id}}" class="outer">
          <div class="card" style="min-width: <%= this.minWidth %>px;">
            <%= v %>
          </div>
        </div>
      <% } %>
    */}
  ]
});
