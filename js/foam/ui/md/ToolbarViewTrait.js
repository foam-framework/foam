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
  imports: [ 'toolbar$' ],

  properties: [
    {
      name: 'toolbar',
      postSet: function(old, nu) {
        old && old.removeActions &&
            old.removeActions(this.toolbarActions_.concat(this.dataToolbarActions_));
        nu && nu.addActions &&
            nu.addActions(this.toolbarActions_.concat(this.dataToolbarActions_));
      },
    },
    {
      name: 'data',
      postSet: function(old, nu) {
        if ( old === nu ) return;
        this.dataToolbarActions_ = this.wrapToolbarActions(
            nu,
            (nu && nu.model_ && nu.model_.actions) || []);
      },
    },
    {
      model_: 'ArrayProperty',
      subType: 'foam.ui.md.ToolbarAction',
      name: 'toolbarActions_',
      postSet: function(old, nu) {
        if ( old === nu || ! this.toolbar ) return;
        if ( old ) this.toolbar.removeActions && this.toolbar.removeActions(old);
        if ( nu ) this.toolbar.addActions && this.toolbar.addActions(nu);
      },
    },
    {
      model_: 'ArrayProperty',
      subType: 'foam.ui.md.ToolbarAction',
      name: 'dataToolbarActions_',
      postSet: function(old, nu) {
        if ( old === nu || ! this.toolbar ) return;
        if ( old ) this.toolbar.removeActions && this.toolbar.removeActions(old);
        if ( nu ) this.toolbar.addActions && this.toolbar.addActions(nu);
      },
    },
  ],

  methods: [
    function init() {
      this.SUPER();
      this.toolbarActions_ = this.wrapToolbarActions(this, this.model_.actions);
      this.addDestructor(this.removeToolbarActions.bind(this));
    },
    function removeToolbarActions() {
      if ( ! this.toolbar ) return;
      this.toolbar.removeActions(this.toolbarActions_.concat(this.dataToolbarActions_));
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
      this.X.dynamic(function() {
        toolbarAction.available = isAvailable.apply(data, action);
      });
      this.X.dynamic(function() {
        toolbarAction.enabled = isEnabled.apply(data, action);
      });
      return toolbarAction;
    },
  ],
});
