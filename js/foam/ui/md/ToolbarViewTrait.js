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
  name: 'ToolbarViewTrait',

  requires: [ 'foam.ui.md.ToolbarAction' ],
  imports: [ 'mdToolbar as toolbar' ],

  properties: [
    {
      name: 'toolbar',
      postSet: function(old, nu) {
        old && old.removeRightActions &&
            old.removeRightActions(
                this.toolbarActions_.concat(this.dataToolbarActions_));
        nu && nu.addRightActions &&
            nu.addRightActions(
                this.toolbarActions_.concat(this.dataToolbarActions_));
      },
    },
    {
      name: 'data',
      postSet: function(old, nu) {
        if ( old === nu ) return;
        this.dataToolbarActions_ = this.wrapToolbarActions(
            nu,
            (nu && nu.model_ && nu.model_.getRuntimeActions()) || []);
      },
    },
    {
      type: 'Array',
      subType: 'foam.ui.md.ToolbarAction',
      name: 'toolbarActions_',
      postSet: function(old, nu) {
        if ( old === nu || ! this.toolbar ) return;
        if ( old ) {
          this.toolbar.removeRightActions &&
              this.toolbar.removeRightActions(old);
        }
        if ( nu ) {
          this.toolbar.addRightActions &&
              this.toolbar.addRightActions(nu);
        }
      },
    },
    {
      type: 'Array',
      subType: 'foam.ui.md.ToolbarAction',
      name: 'dataToolbarActions_',
      postSet: function(old, nu) {
        if ( old === nu || ! this.toolbar ) return;
        if ( old ) this.toolbar.removeRightActions && this.toolbar.removeRightActions(old);
        if ( nu ) this.toolbar.addRightActions && this.toolbar.addRightActions(nu);
      },
    },
    {
      type: 'Boolean',
      name: 'hideOwnActions',
      help: "If true, do not autoxmatically add the view's own actions to the toolbar, just the data's actions",
      defaultValue: false,
    },
  ],

  methods: [
    function init() {
      this.SUPER();
      if ( ! this.hideOwnActions ) {
        var initializer = function() {
          this.toolbarActions_ = this.wrapToolbarActions(
              this, this.model_.getRuntimeActions());
          this.addDestructor(destructor);
        }.bind(this);
        var destructor = function() {
          this.removeToolbarActions();
          this.addInitializer(initializer);
        }.bind(this);
        this.addInitializer(initializer);
      }
    },
    function removeToolbarActions() {
      if ( ! this.toolbar ) return;
      this.toolbar.removeRightActions(
          this.toolbarActions_.concat(this.dataToolbarActions_));
    },
    function wrapToolbarActions(data, actions) {
      return actions.map(this.wrapToolbarAction.bind(this, data));
    },
    function wrapToolbarAction(data, action) {
      var isAvailable = action.isAvailable;
      var isEnabled = action.isEnabled;
      var toolbarAction = this.ToolbarAction.create({
        data: data,
        action: action,
      }, this.Y);
      this.X.dynamicFn(function() {
        toolbarAction.available = isAvailable.apply(data, action);
      });
      this.X.dynamicFn(function() {
        toolbarAction.enabled = isEnabled.apply(data, action);
      });
      return toolbarAction;
    },
  ],
});
