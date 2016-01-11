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
  name: 'EditableView',
  package: 'foam.ui.md',
  extends: 'foam.ui.View',

  constants: { ELEMENT_NAME: 'toggle-editable' },

  requires: [
    'foam.ui.md.TextFieldView',
  ],

  traits: ['foam.ui.md.MDStyleTrait'],

  properties: [
    {
      name: 'data',
      postSet: function(old, nu) {
        this.childData = nu;
      },
    },
    {
      type: 'String',
      name: 'mode',
      defaultValue: 'read-only',
      postSet: function(old, nu) {
        if ( old === nu ) return;
        if ( old === 'read-write' && nu === 'read-only' ) {
          // Leaving edit mode, so write the data change upstream.
          this.data = this.childData;
        }
        if ( this.contentView_ ) this.contentView_.mode = nu;
        if ( this.icon ) {
          if ( nu === 'read-only' ) this.icon.src = this.editIconUrl;
          else                      this.icon.src = this.doneIconUrl;
        }
      },
    },
    {
      type: 'String',
      name: 'editIconUrl',
      defaultValue: 'https://www.google.com/images/icons/material/system/1x/create_black_18dp.png',
    },
    {
      type: 'String',
      name: 'doneIconUrl',
      defaultValue: 'https://www.google.com/images/icons/material/system/1x/done_black_18dp.png',
    },
    {
      name: 'icon',
    },
    {
      name: 'childData',
      documentation: 'The data object passed down to the child view. ' +
          'Upstream changes to my data are forwarded to childData, but ' +
          'downstream edits to the childData are not passed up until the ' +
          'mode is returned to read-only.',
    },
    {
      name: 'className',
      defaultValue: 'editable-view',
    },
  ],

  listeners: [
    {
      name: 'onIconClick',
      code: function() {
        this.mode = (this.mode === 'read-only' ? 'read-write' : 'read-only');
      },
    },
  ],

  methods: {
    shouldDestroy: function() {
      return false;
    },
    addDataChild: function(view) {
      Events.link(this.childData$, view.data$);
      this.addChild(view);
    }
  },
  templates: [
    function toHTML() {/*
      <div id="<%= this.id %>" <%= this.cssClassAttr() %>>
        $$data{ model_: 'foam.ui.md.TextFieldView', mode$: this.mode$, inlineStyle: true, floatingLabel: false }
        <img id="{{this.id}}-icon"
             src="<%= this.mode === 'read-only' ? this.editIconUrl : this.doneIconUrl %>"
             class="<%= this.mode === 'read-only' ? '' : 'hide' %>">
        <% this.on('click', this.onIconClick, this.id + '-icon'); %>
        <% this.addInitializer(function() {
          self.icon = self.X.$(self.id + '-icon');
        }); %>
      <% this.setMDClasses(); %>
      </div>
    */},
    function CSS() {/*
      .editable-view {
        display: flex;
        align-items: flex-end;
      }
      .editable-view img {
        cursor: pointer;
      }
      .editable-view img.hide {
        display: none;
      }
    */},
  ],
});
