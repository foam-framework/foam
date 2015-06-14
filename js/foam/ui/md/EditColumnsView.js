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
  name: 'EditColumnsView',
  extendsModel: 'foam.ui.SimpleView',

  imports: [
    'document',
    'window'
  ],

  properties: [
    {
      model_: 'ModelProperty',
      name: 'model',
      required: true,
      postSet: function(old, nu) {
        if ( old === nu ) return;
        console.log('setting model', nu);
        if ( nu )
          this.availableProperties = nu.tableProperties.map(function(propName) {
            return nu.getProperty(propName);
          }.bind(this));
      }
    },
    {
      model_: 'StringArrayProperty',
      name: 'properties',
      postSet: function() {
        if ( ! this.$ ) return;
        this.$.innerHTML = this.toInnerHTML();
        this.initInnerHTML();
      }
    },
    {
      model_: 'ArrayProperty',
      name: 'availableProperties',
      lazyFactory: function() { return []; }
    },
    {
      model_: 'BooleanProperty',
      name: 'isOpen',
      defaultValue: false
    },
    {
      model_: 'IntProperty',
      name: 'x',
      postSet: function(old, nu) {
        if ( ! this.$ || old === nu ) return;
        this.$.style.right = this.document.documentElement.clientWidth - nu;
      }
    },
    {
      model_: 'IntProperty',
      name: 'y',
      postSet: function(old, nu) {
        if ( ! this.$ || old === nu ) return;
        this.$.style.top = nu;
      }
    },
    {
      name: 'height',
      defaultValue: 0,
      postSet: function(old, nu) {
        if ( ! this.$ || old === nu || Number.isNaN(nu) ) return;
        if ( nu < 0 ) this.$.style.height = this.getFullHeight() + 'px';
        else          this.$.style.height = nu + 'px';
      }
    },
    {
      name: 'showBorder',
      defaultValue: false,
      postSet: function(old, nu) {
        if ( ! this.$ || old === nu ) return;
        if ( nu ) this.$.style.border = '2px solid grey';
        else      this.$.style.border = 'none';
      }
    },
    {
      name: 'coverPage',
      defaultValue: false,
      postSet: function(old, nu) {
        if ( ! this.$ || old === nu ) return;
        var container = this.$.parentElement;
        var style = container.style;
        if ( nu ) {
          style.top = style.bottom = style.left = style.right = '0px';
        } else {
          style.top = style.bottom = style.left = style.right = 'initial';
        }
      }
    },
    {
      name: 'listeningForCancel_',
      defaultValue: false
    }
  ],

  methods: [
    function open() {
      if ( ! this.$ || this.isOpen ) return;
      console.log('open');
      this.showBorder = true;
      this.height = -1;
      this.coverPage = true;
      this.isOpen = true;
      this.listenForCancel();
    },
    function close() {
      if ( ! this.$ || ! this.isOpen ) return;
      console.log('close');
      this.height = 0;
      this.coverPage = false;
      this.isOpen = false;
      this.unlistenForCancel();
    },
    function isPropEnabled(prop) {
      return this.properties.indexOf(prop.name) >= 0;
    },
    function getPropClass(prop) {
      return this.isPropEnabled(prop) ? 'enabled' : '';
    },
    function getPositionStyle() {
      return 'top:' + this.y + ';right:' +
          (this.document.documentElement.clientWidth - this.x) + ';height:' +
          (this.height < 0 ? this.getFullHeight() + 'px' : this.height + 'px');
    },
    function getFullHeight() {
      if ( ! this.$ ) return 0;
      var children = this.$.children;
      var height = 0;
      for ( var i = 0; i < children.length; ++i ) {
        height += children[i].offsetHeight;
      }
      return height;
    },
    function onClick(prop, e) {
      console.log('onClick');
      e.stopPropagation();
      if ( this.isPropEnabled(prop) ) {
        // Property being removed.
        this.properties = this.properties.filter(function(propName) {
          return propName !== prop.name;
        });
      } else {
        // Property being added. Properties list is now list of every property
        // name where:
        // (1) Property is the one being enabled,
        // OR
        // (2) Property was already enabled.
        // Filter/map over availableProperties preserves availableProperties
        // order.
        this.properties = this.availableProperties.filter(function(p) {
          return p.name === prop.name || this.properties.indexOf(p.name) >= 0;
        }.bind(this)).map(function(p) {
          return p.name;
        });
      }
    },
    function initHTML() {
      this.SUPER();
      if ( this.$ ) this.$.addEventListener('transitionend', this.onTransitionEnd);
    }
  ],

  listeners: [
    {
      name: 'listenForCancel',
      isFramed: true,
      code: function() {
        if ( this.listeningForCancel_ ) return;
        console.log('listenForCancel');
        if ( this.isOpen ) {
          this.document.body.addEventListener('click', this.onCancel);
          this.listeningForCancel_ = true;
        } else {
          console.log('** NOT LISTENING');
        }
      }
    },
    {
      name: 'unlistenForCancel',
      isFramed: true,
      code: function() {
        if ( ! this.listeningForCancel_ ) return;
        console.log('unlistenForCancel');
        if ( ! this.isOpen ) {
          this.document.body.removeEventListener('click', this.onCancel);
          this.listeningForCancel_ = false;
        } else {
          console.log('** NOT UNLISTENING');
        }
      }
    },
    {
      name: 'onCancel',
      code: function(e) {
        console.log('onCancel');
        this.close();
      }
    },
    {
      name: 'onTransitionEnd',
      code: function(e) {
        console.log('transition end');
        this.showBorder = this.isOpen;
      }
    }
  ],

  templates: [
    function toHTML() {/*
      <popup-container>
        <popup id="%%id" style="<%= this.getPositionStyle() %>">
          <% this.toInnerHTML(out); %>
        </popup>
      </popup-container>
    */},
    function toInnerHTML() {/*
      <% if ( this.model ) {
           for ( var i = 0; i < this.availableProperties.length; ++i ) {
             var prop = this.availableProperties[i]; %>
             <item id="<%= this.on('click', this.onClick.bind(this, prop)) %>"
                   class="<%= this.getPropClass(prop) %>">
               {{prop.label}}
             </item>
        <% } %>
      <% } %>
    */},
    function CSS() {/*
      popup-container {
        position: fixed;
        z-index: 1009;
      }
      popup {
        font-size: 13px;
        font-weight: 400;
        display: block;
        position: fixed;
        border: 2px solid grey;
        background: white;
        z-index: 1010;
        overflow: hidden;
        transition: height 0.25s cubic-bezier(0,.3,.8,1);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.38);
      }
      popup item {
        display: block;
        cursor: pointer;
        padding: 12px;
      }
      popup item.enabled {
        font-weight: bold;
      }
      popup item:hover {
        background: #EEEEEE;
      }
    */}
   ]
});
