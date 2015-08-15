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

  properties: [
    'data',
    {
      model_: 'ArrayProperty',
      subType: 'foam.ui.md.ToolbarAction',
      name: 'actions',
    },
    {
      model_: 'ViewFactoryProperty',
      name: 'actionViewFactory',
      defaultValue: 'foam.ui.md.FlatButton',
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
