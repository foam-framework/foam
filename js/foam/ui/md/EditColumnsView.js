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
  extends: 'foam.ui.SimpleView',

  requires: [
    'foam.ui.md.CheckboxView',
    'foam.ui.md.HaloView'
  ],
  imports: [
    'document',
    'window'
  ],

  properties: [ 'data' ],

  methods: [
    function isPropEnabled(prop) {
      return this.data && this.data.properties.indexOf(prop.name) >= 0;
    },
    function bindPropDataChange() {
      this.onPropDataChange.apply(this, arguments);
    }
  ],

  listeners: [
    {
      name: 'onPropDataChange',
      // CheckboxView.halo easeInTime + easeOutTime + 10
      isMerged: 200 + 150 + 10,
      code: function(prop, _, __, ___, isEnabled) {
        if ( ! this.data ) return;
        var data = this.data;
        if ( isEnabled ) {
          // Property being added. Properties list is now list of every property
          // name where:
          // (1) Property is the one being enabled,
          // OR
          // (2) Property was already enabled.
          // Filter/map over availableProperties preserves availableProperties
          // order.
          data.properties = data.availableProperties.filter(function(p) {
            return p.name === prop.name || data.properties.indexOf(p.name) >= 0;
          }).map(function(p) {
            return p.name;
          });
        } else {
          // Property being removed.
          data.properties = data.properties.filter(function(propName) {
            return propName !== prop.name;
          });
        }
      },
    },
  ],

  templates: [
    function toHTML() {/*
      <column-list id="%%id">
        <% this.toInnerHTML(out); %>
      </column-list>
    */},
    function toInnerHTML() {/*
      <% var data = this.data;
         if ( data.model ) {
           for ( var i = 0; i < data.availableProperties.length; ++i ) {
             var prop = data.availableProperties[i];
             var checkbox = this.CheckboxView.create({
               checkboxPosition: 'left',
               prop: prop,
               data: this.isPropEnabled(prop),
               halo: this.HaloView.create({
                 easeInTime: 200,
                 easeOutTime: 150
               }, this.Y)
             }, this.Y);
             checkbox.data$.addListener(this.bindPropDataChange.bind(this, prop));

             out(checkbox);
             this.addChild(checkbox);
           }
         } %>
    */},
    function CSS() {/*
      column-list {
        display: block;
      }
      column-list item {
        display: block;
        cursor: pointer;
        padding: 14px 30px;
      }
    */}
   ]
});
