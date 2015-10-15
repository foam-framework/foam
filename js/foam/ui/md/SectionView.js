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
    'foam.ui.Icon',
    'foam.ui.md.ExpandableView'
  ],

  constants: { ELEMENT_NAME: 'section' },

  properties: [
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
      name: 'title',
      defaultValue: 'Heading'
    },
    {
      model_: 'StringProperty',
      name: 'titleClass',
      defaultValue: 'md-subhead'
    },
    {
      model_: 'ViewFactoryProperty',
      name: 'icon',
      defaultValue: null
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
    },
    {
      model_: 'StringProperty',
      name: 'expandedIconId',
      lazyFactory: function() { return this.id + '-expanded-icon'; }
    },
    {
      model_: 'ViewFactoryProperty',
      name: 'expandedIcon',
      defaultValue: function() {
        return this.Icon.create({
          id: this.expandedIconId,
          url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAARUlEQVR4AWMY1GAUNAAhScr/A2EDKcr/ACFcC2HlvxnCGMIhWohVDgQwLYSVh8K4hLU0AJWHQNkILXX47NDCIjIIwSgAAGEBHc5iOzTwAAAAAElFTkSuQmCC',
          ligature: 'expand_less',
          extraClassName: 'expanded-icon'
        }, this.Y);
      }
    },
  ],

  methods: [
    {
      name: 'initHTML',
      code: function() {
        this.SUPER.apply(this, arguments);
        if ( this.expandable ) {
          this.delegateView.expandedIcon = this.X.$(this.expandedIconId);
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

      <heading id="{{this.id}}-heading" class="{{this.titleClass}}">
        <% if ( this.icon ) { %>%%icon()<% } %>
        <span>{{this.title}}</span>
        <% if ( this.expandable ) {
             this.on('click', this.onToggleExpanded, this.id + '-heading'); %>
             <div class="flex-flush-right">
               %%expandedIcon()
             </div>
        <% } %>
      </heading>

      %%delegateView
    */},
    function CSS() {/*
      section heading {
        display: flex;
        align-items: center;
        cursor: pointer;
        margin: 8px 0;
      }
      section heading > * {
        flex-grow: 0;
      }
      section heading div.flex-flush-right {
        flex-grow: 1;
        display: flex;
        justify-content: flex-end;
      }
      section heading icon {
        margin-right: 12px;
      }
      section heading icon.expanded-icon {
        margin-right: initial;
      }
    */}
  ]
});
