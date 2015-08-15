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
  name: 'ToolbarAction',
  extendsModel: '',
  properties: [
    'data',
    {
      model_: 'BooleanProperty',
      name: 'available',
      defaultValue: true,
    },
    {
      model_: 'BooleanProperty',
      name: 'enabled',
      defaultValue: true,
    },
    {
      model_: 'FunctionProperty',
      name: 'code',
      defaultValue: null,
      postSet: function(old, nu) {
        if ( old === nu || ! this.action || ! nu ) return;
        this.action.action = nu;
      },
    },
    {
      type: 'Action',
      name: 'action',
      postSet: function(old, nu) {
        if ( old === nu || ! nu ) return;
        nu.isAvailable = this.isAvailable;
        nu.isEnabled = this.isEnabled;
        if ( this.code ) nu.action = this.code;
      },
    },
  ],

  listeners: [
    {
      name: 'isAvailable',
      code: function() { return this.available; },
    },
    {
      name: 'isEnabled',
      code: function() { return this.enabled; },
    },
  ],
});
