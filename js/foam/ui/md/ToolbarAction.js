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

  properties: [
    {
      name: 'data',
      postSet: function() {
        this.setupDynamic();
      }
    },
    {
      type: 'Action',
      name: 'action',
      postSet: function() {
        this.setupDynamic();
      }
    },
    {
      model_: 'StringEnumProperty',
      name: 'placement',
      defaultValue: 'right',
      choices: [
        'left',
        'right',
        'overflow',
        'fab',
      ],
    },
    {
      model_: 'BooleanProperty',
      name: 'isEnabled',
    },
    {
      model_: 'BooleanProperty',
      name: 'isAvailable',
    },
    {
      name: 'priority',
      defaultValue: 10,
    },
    {
      name: 'order',
      defaultValue: 100.0,
    },
    {
      name: 'bindings_'
    },
  ],

  methods: [
    function setupDynamic() {
      /* Connect dynamic listeners to available and enabled state of action. */
      if ( this.bindings_ ) {
        this.bindings_.destroy();
        this.bindings_ = null;
      }
      if ( ! ( this.data && this.action ) ) return;

      this.bindings_ = this.X.dynamic(function() {
        this.isAvailable = this.action.isAvailable.apply(this.data, this.action);
        this.isEnabled = this.action.isEnabled.apply(this.data, this.action);
        this.priority = this.action.priority;
        this.order = this.action.order;
      }.bind(this));

    }
  ]
});
