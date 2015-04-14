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
  extendsModel: 'foam.flow.Element',

  constants: { ELEMENT_NAME: 'toggle-editable' },

  requires: [
    'foam.ui.md.TextFieldView',
  ],

  properties: [
    {
      model_: 'StringProperty',
      name: 'mode',
      defaultValue: 'read-only',
      postSet: function(old, nu) {
        if ( old === nu ) return;
        if ( this.contentView_ ) this.contentView_.mode = nu;
        if ( this.icon ) {
          if ( nu === 'read-only' ) this.icon.src = this.editIconUrl;
          else                      this.icon.src = this.doneIconUrl;
        }
      },
    },
    {
      model_: 'StringProperty',
      name: 'editIconUrl',
      defaultValue: 'https://www.google.com/images/icons/material/system/1x/create_black_18dp.png',
    },
    {
      model_: 'StringProperty',
      name: 'doneIconUrl',
      defaultValue: 'https://www.google.com/images/icons/material/system/1x/done_black_18dp.png',
    },
    {
      name: 'icon',
    },
    {
      model_: 'ViewFactoryProperty',
      name: 'contentView',
      factory: function() {
        return this.TextFieldView.xbind({ mode: this.mode });
      },
    },
    {
      name: 'contentView_',
    },
  ],

  methods: [
    {
      name: 'initHTML',
      code: function() {
        this.SUPER.apply(this, arguments);
        this.icon = this.X.$(this.id + '-icon');
      },
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

  templates: [
    function toInnerHTML() {/*
      <%=
        (function() {
          this.contentView_ = this.contentView();
          this.addDataChild(this.contentView_);
          return this.contentView_.toHTML();
        }.bind(this))()
      %>
      <img id="{{this.id}}-icon"
           src="<%= this.mode === 'read-only' ? this.editIconUrl : this.doneIconUrl %>"
           class="<%= this.mode === 'read-only' ? '' : 'hide' %>">
      <% this.on('click', this.onIconClick, this.id + '-icon'); %>
    */},
    function CSS() {/*
      toggle-editable {
        display: flex;
        align-items: center;
      }
      toggle-editable img {
        cursor: pointer;
      }
      toggle-editable img.hide {
        display: none;
      }

      toggle-editable .md-text-field-input {
        margin: 16px;
      }
    */},
  ],
});
