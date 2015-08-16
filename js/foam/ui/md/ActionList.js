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
  extendsModel: 'foam.ui.SimpleView',

  requires: [ 'foam.ui.md.FlatButton' ],
  imports: [ 'dropdown' ],

  properties: [
    'data',
    {
      model_: 'ArrayProperty',
      subType: 'foam.ui.md.ToolbarAction',
      name: 'actions',
      postSet: function(old, nu) {
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
    },
    {
      model_: 'ViewFactoryProperty',
      name: 'actionViewFactory',
      defaultValue: 'foam.ui.md.FlatButton',
    },
  ],

  listeners: [
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
        <% for ( var i = 0; i < this.actions.length; ++i ) {
          var actionView = this.actionViewFactory({
            data$: this.actions[i].data$,
            action$: this.actions[i].action$,
          }, this.Y);
          out(actionView);
          this.addChild(actionView);
        } %>
      </action-list>
    */},
    function CSS() {/*
      action-list {
        display: flex;
        flex-direction: column;
      }
    */},
  ],
});
