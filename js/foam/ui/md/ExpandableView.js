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
  name: 'ExpandableView',
  extends: 'foam.flow.Element',

  requires: [
    'foam.ui.CSSTransitionSet',
    'foam.ui.md.RotateFwdBwdAnimation'
  ],

  constants: { ELEMENT_NAME: 'expandable' },

  properties: [
    {
      model_: 'ViewFactoryProperty',
      name: 'delegate'
    },
    {
      name: 'delegateView'
    },
    {
      name: 'expandableContent'
    },
    {
      model_: 'BooleanProperty',
      name: 'expanded',
      defaultValue: true
    },
    {
      name: 'expandedIcon',
      required: true,
      postSet: function(old, nu) {
        if ( old === nu || ! this.expandedIconAnimation ) return;
        this.expandedIconAnimation.element = this.expandedIcon;
      }
    },
    {
      name: 'expandedIconAnimation',
      lazyFactory: function() {
        return this.RotateFwdBwdAnimation.create({
          element: this.expandedIcon,
          rotation: this.expanded ? 0.5 : 0 // Icon rotation, measured in turns.
        });
      }
    },
    {
      name: 'expandCollapseDuration',
      units: 'ms',
      defaultValue: 200,
      postSet: function(old, nu) {
        if ( old === nu ) return;
        this.heightTransition = nu;
      }
    },
    {
      name: 'heightTransitionFn',
      defaultValue: 'cubic-bezier(0,.3,.8,1)'
    },
    {
      name: 'heightTransition',
      defaultValueFn: function () {
        return this.expandCollapseDuration + 'ms cubic-bezier(0,.3,.8,1)';
      },
      adapt: function(old, nu) {
        if ( old === nu || typeof nu === 'string' ) return nu;
        if ( typeof nu === 'number' )
          return nu + 'ms' + (this.heightTransitionFn ?
              ' ' + this.heightTransition : '');
        else
          return nu.toString();
      },
      postSet: function(old, nu) {
        if ( old === nu ) return;
        if ( this.transitions ) this.transitions.height = nu;
      }
    },
    {
      name: 'transitions',
      factory: function() {
        return this.CSSTransitionSet.create({
          height: this.heightTransition
        });
      },
      postSet: function(old, nu) {
        if ( old === nu ) return;
        if ( old ) old.unsubscribe(['property'], this.onTransitionChange);
        if ( nu ) nu.subscribe(['property'], this.onTransitionChange);
      }
    },
    {
      model_: 'StringProperty',
      name: 'transitionString',
      factory: function() {
        return this.transitions ? this.transitions.toString() : '';
      }
    },
    {
      model_: 'BooleanProperty',
      name: 'transitionsEnabled',
      defaultValue: true
    }
  ],

  methods: [
    {
      name: 'initHTML',
      code: function() {
        this.SUPER.apply(this, arguments);

        this.expandableContent = this.X.$(this.id + '-content');
        this.$.style.height = this.expanded ?
            this.expandableContent.offsetHeight + 'px' : '0px';

        this.transitionString$.addListener(this.onTransitionDepChange);
        this.transitionsEnabled$.addListener(this.onTransitionDepChange);
        this.onTransitionDepChange();
      }
    },
    {
      name: 'expand',
      code: function() {
        this.$.style.height = this.expandableContent.offsetHeight + 'px';
      }
    },
    {
      name: 'collapse',
      code: function() {
        this.$.style.height = '0px';
      }
    },
    {
      name: 'toggleExpandedIcon',
      code: function() {
        if ( ! this.expandedIconAnimation ) return;
        if ( this.expanded ) this.expandedIconAnimation.bwdAnimation();
        else                 this.expandedIconAnimation.fwdAnimation();
      }
    }
  ],

  actions: [
    {
      name: 'toggleExpanded',
      code: function() {
        if ( this.expanded ) this.collapse();
        else                 this.expand();
        this.toggleExpandedIcon();
        this.expanded = ! this.expanded;
      }
    }
  ],

  listeners: [
    {
      name: 'onTransitionChange',
      code: function() {
        this.transitionString = this.transitions.toString();
      }
    },
    {
      name: 'onTransitionDepChange',
      code: function() {
        if ( ! this.$ ) return;
        this.$.style.transition = this.transitionsEnabled ?
            this.transitionString : '';
      }
    }
  ],

  templates: [
    function toInnerHTML() {/*
      <% this.delegateView = this.delegate();
         this.addDataChild(this.delegateView);
      %>
      <expandable-content id="{{this.id}}-content">
        %%delegateView
      </expandable-content>
    */},
    function CSS() {/*
      expandable {
        display: block;
        overflow: hidden;
      }
      expandable expandable-content {
        display: block;
      }
    */}
  ]
});
