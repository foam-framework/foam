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
  name: 'ActionList',
  extends: 'foam.ui.SimpleView',

  requires: [ 'foam.ui.md.FlatButton' ],
  imports: [ 'dropdown' ],

  properties: [
    {
      type: 'String',
      name: 'className',
      defaultValue: 'md-actions',
    },
    {
      type: 'Array',
      subType: 'foam.ui.md.ToolbarAction',
      name: 'data',
      preSet: function(old, nu) {
        if ( ! nu ) return [];
        var list = nu.sort(this.actionComparator);
        return this.maxNumActions > 0 ? list.slice(0, this.maxNumActions) :
            list;
      },
      postSet: function(old, nu) {
        this.bindActionListeners(old, nu);
        this.onDataChange(old, nu);
      },
    },
    {
      model_: 'foam.core.types.StringEnumProperty',
      name: 'direction',
      defaultValue: 'HORIZONTAL',
      choices: [
        ['HORIZONTAL', 'Horizontal'],
        ['VERTICAL', 'Vertical'],
      ],
      postSet: function(old, nu) {
        if ( old === nu || ! this.$ ) return;
        this.$.style['flex-direction'] = nu === 'VERTICAL' ?
            'column' : 'row';
      },
    },
    {
      type: 'Int',
      name: 'maxNumActions',
      documentation: function() {/*
        Maximum number of $$DOC{ref:'Action',usePlural:true} to render. Value
        less than or equal to zero indicates "render all actions".
      */},
      defaultValue: 0,
    },
    {
      type: 'ViewFactory',
      name: 'actionViewFactory',
      defaultValue: 'foam.ui.ActionButton',
    },
  ],

  methods: [
    function bindActionListeners(old, nu) {
      if ( old === nu ) return;
      var i;
      if ( old && old.length ) {
        for ( i = 0; i < old.length; ++i ) {
          old[i].data$.removeListener(this.onActionDataChange);
        }
      }
      if ( nu && nu.length ) {
        for ( i = 0; i < nu.length; ++i ) {
          nu[i].data$.addListener(this.onActionDataChange);
          this.onActionDataChange(nu[i], ['property', 'data'], null, nu[i].data);
        }
      }
    },
    function actionComparator(a, b) {
      var aPriority = (a && a.action) ? a.action.priority : 10;
      var bPriority = (b && b.action) ? b.action.priority : 10;
      var priorityCmp = aPriority - bPriority;
      if ( priorityCmp !== 0 ) return priorityCmp;

      var aOrder = (a && a.action) ? a.action.order : 100.0;
      var bOrder = (b && b.action) ? b.action.order : 100.0;
      var orderCmp = aOrder - bOrder;
      return orderCmp;
    },
  ],

  listeners: [
    {
      name: 'onDataChange',
      isFramed: true,
      code: function(old, nu) {
        if ( ! this.$ ) return;
        if ( this.children.length !== 0 ) {
          var children = this.children.slice();
          for ( var i = 0; i < children.length; ++i ) {
            this.removeChild(children[i]);
          }
        }
        var out = TemplateOutput.create(this);
        this.toInnerHTML(out);
        this.$.innerHTML = out.toString();
        this.initInnerHTML();
      },
    },
    {
      name: 'onActionDataChange',
      code: function(toolbarAction, topic, old, nu) {
        if ( old && old.unsubscribe )
          old.unsubscribe(['action', toolbarAction.action.name], this.onAction);
        if ( nu && nu.subscribe )
          nu.subscribe(['action', toolbarAction.action.name], this.onAction);
      },
    },
    {
      name: 'onAction',
      code: function() { this.dropdown && this.dropdown.close(); },
    },
  ],

  templates: [
    function toHTML() {/*
      <action-list id="%%id" %%cssClassAttr()>
        <% this.toInnerHTML(out); %>
      </action-list>
      <% this.setClass('vertical',
             function() { return this.direction === 'VERTICAL'; }.bind(this),
             this.id);
         this.setClass('horizontal',
             function() { return this.direction === 'HORIZONTAL'; }.bind(this),
             this.id); %>
    */},
    function toInnerHTML() {/*
      <% var actions = this.data;
         for ( var i = 0; i < actions.length; ++i ) {
           var actionView = this.actionViewFactory({
             data$: actions[i].data$,
             action$: actions[i].action$,
           }, this.Y);
           out(actionView);
           this.addChild(actionView);
         } %>
    */},
    function CSS() {/*
      action-list {
        display: flex;
      }
      action-list.vertical {
        flex-direction: column;
        margin-top: 8px;
      }
      action-list.horizontal {
        flex-direction: row;
        margin-left: 8px;
      }
    */},
  ],
});
