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
  package: 'foam.ui.md',
  name: 'SectionView',
  extends: 'foam.flow.Element',

  requires: [
    'foam.ui.md.ExpandableView'
  ],

  constants: { ELEMENT_NAME: 'section' },

  properties: [
    {
      model_: 'StringProperty',
      name: 'iconUrl'
    },
    {
      model_: 'BooleanProperty',
      name: 'expandable',
      defaultValue: true,
      postSet: function(old, nu) {
        if ( ! this.$ || old === nu ) return;
        // Need full re-render to correctly wire (or not wire) this.on('click').
        this.updateHTML();
      }
    },
    {
      model_: 'BooleanProperty',
      name: 'expanded',
      defaultValue: true
    },
    {
      model_: 'StringProperty',
      name: 'expandedIconUrl',
      defaultValue: 'https://www.gstatic.com/images/icons/material/system/1x/expand_less_black_24dp.png'
    },
    {
      model_: 'StringProperty',
      name: 'title',
      defaultValue: 'Heading'
    },
    {
      model_: 'ViewFactoryProperty',
      name: 'delegate'
    },
    {
      name: 'delegateView',
      postSet: function(old, nu) {
        if ( old && old.expanded$ )
          Events.unfollow(this.expanded$, old.expanded$);
        if ( nu && nu.expanded$ )
          Events.follow(this.expanded$, nu.expanded$);
      }
    }
  ],

  methods: [
    {
      name: 'initHTML',
      code: function() {
        this.SUPER.apply(this, arguments);
        if ( this.expandable ) {
          this.delegateView.expandedIcon = this.X.$(this.id + '-expanded-icon');
        }
      }
    }
  ],

  listeners: [
    {
      name: 'onToggleExpanded',
      code: function() {
        this.delegateView && this.delegateView.toggleExpanded &&
            this.delegateView.toggleExpanded();
      }
    }
  ],

  templates: [
    function toInnerHTML() {/*
      <% this.delegateView = this.delegate();
         this.addDataChild(this.delegateView); %>

      <heading id="{{this.id}}-heading">
        <% if ( this.iconUrl ) { %><span><img src="{{this.iconUrl}}"></span><% } %>
        <span>{{this.title}}</span>
        <% if ( this.expandable ) {
           this.on('click', this.onToggleExpanded, this.id + '-heading'); %>
          <div class="flex-flush-right">
            <img src="{{this.expandedIconUrl}}" id="{{this.id}}-expanded-icon">
          </div>
        <% } %>
      </heading>

      %%delegateView
    */},
    function CSS() {/*
      section heading {
        display: flex;
        align-items: stretch;
        cursor: pointer;
        margin: 0px 10px;
      }
      section heading > * {
        flex-grow: 0;
      }
      section heading div.flex-flush-right {
        flex-grow: 1;
      }
      section heading div.flex-flush-right {
        display: flex;
        justify-content: flex-end;
      }
    */}
  ]
});
