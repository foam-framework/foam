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
  package: 'foam.apps.builder',
  name: 'InfoOptionView',
  extends: 'foam.ui.SimpleView',

  requires: [
    'foam.ui.md.ExpandableView',
    'foam.ui.md.SectionView',
  ],

  models: [
    {
      name: 'TwoView',
      extends: 'foam.ui.SimpleView',

      properties: [
        { type: 'ViewFactory', name: 'first', defaultValue: null },
        { type: 'ViewFactory', name: 'second', defaultValue: null },
      ],

      templates: [
        function toHTML() {/*
          <% if ( this.first ) { %>
            %%first()
          <% } %>
          <% if ( this.second ) { %>
            %%second()
          <% } %>
        */},
      ],
    },
  ],

  properties: [
    {
      type: 'String',
      name: 'title',
      defaultValue: 'Info heading'
    },
    {
      type: 'ViewFactory',
      name: 'icon',
      defaultValue: null
    },
    {
      type: 'ViewFactory',
      name: 'details',
      defaultValue: null,
    },
    {
      type: 'ViewFactory',
      name: 'option',
      defaultValue: null,
    },
    {
      type: 'ViewFactory',
      name: 'outer',
      defaultValue: function() {
        return this.ExpandableView.create({
          delegate: this.inner.bind(this),
          extraClassName: 'info-option-outer',
          contentClassName: 'md-card-content info-option-content',
          expanded: false,
        }, this.Y);
      },
    },
    {
      type: 'ViewFactory',
      name: 'inner',
      defaultValue: function() {
        return this.TwoView.create({
          first: {
            factory_: 'foam.ui.md.SectionView',
            icon$: this.icon$,
            title$: this.title$,
            expanded: false,
            delegate: {
              factory_: 'foam.ui.md.ExpandableView',
              delegate: this.details,
            },
          },
          second: this.option,
        }, this.Y);
      },
    },
  ],

  methods: [
    function expand() {
      this.outerView && this.outerView.expand && this.outerView.expand();
    },
    function collapse() {
      this.outerView && this.outerView.collapse && this.outerView.collapse();
    },
    // TODO(markdittmer): This should be pushed to a more general view model.
    function addFactoryChild(fName) {
      var view = this[fName]();
      this[fName + 'View'] = view;
      this.addChild(view);
      return view;
    },
  ],

  templates: [
    function toHTML() {/*
      <info-option id="%%id" %%cssClassAttr()>
        <%= this.addFactoryChild('outer') %>
      </info-option>
    */},
    function CSS() {/*
      info-option {
        display: block;
      }
      info-option .expanded.info-option-outer {
        border-top: 1px solid rgba(0,0,0,0.1);
      }
      info-option .info-option-content {
        margin: 8px 0;
      }
    */},
  ],
});
