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
  name: 'OverflowActionList',
  extendsModel: 'foam.ui.SimpleView',

  requires: [
    'foam.ui.ActionButton',
    'foam.ui.md.ActionList',
    'foam.ui.md.OverlayDropdownView',
  ],

  properties: [
    {
      model_: 'ArrayProperty',
      subType: 'foam.ui.md.ToolbarAction',
      name: 'data',
      postSet: function(old, nu) {
        if ( old === nu ) return;
        this.showActions_ = nu.slice(0, this.maxShowActions);
        this.moreActions_ = nu.slice(this.maxShowActions);
      },
    },
    {
      model_: 'IntProperty',
      name: 'maxShowActions',
      defaultValue: 3,
    },
    {
      name: 'showActionList',
      lazyFactory: function() {
        return this.ActionList.create({
          data$: this.showActions_$,
          direction: 'HORIZONTAL',
          actionViewFactory: this.ActionButton,
        }, this.Y);
      },
    },
    {
      model_: 'ViewFactoryProperty',
      name: 'moreActionsFactory',
      defaultValue: {
        factory_: 'foam.ui.md.FlatButton',
        color: '#4285F4',
      },
    },
    {
      type: 'foam.ui.md.OverlayDropdownView',
      name: 'moreActionsDropdown',
      lazyFactory: function() {
        return this.OverlayDropdownView.create({
          data$: this.moreActions_$,
          delegate: this.ActionList.xbind({
            actionViewFactory: this.moreActionsFactory,
          }, this.Y),
        }, this.Y);
      },
    },
    {
      model_: 'ArrayProperty',
      subType: 'foam.ui.md.ToolbarAction',
      name: 'showActions_',
    },
    {
      model_: 'ArrayProperty',
      subType: 'foam.ui.md.ToolbarAction',
      name: 'moreActions_',
    },
  ],

  actions: [
    {
      name: 'moreActions',
      // TODO(markdittmer): This URL is for menus, not "more actions".
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAGklEQVQ4y2NgGAVEg/9EAMo0jHp61NOjAAgAUWrXKeQhPE4AAAAASUVORK5CYII=',
      ligature: 'more_vert',
      action: function() { this.moreActionsDropdown.open(); },
    },
  ],

  templates: [
    function toHTML() {/*
      <actions id="%%id" %%cssClassAttr()>
        %%moreActionsDropdown
        %%showActionList
        $$moreActions
      </actions>
    */},
  ],
});
