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
  package: 'foam.apps.builder.administrator',
  name: 'DesignerView',
  extends: 'foam.apps.builder.DesignerView',

  traits: [
    'foam.metrics.ScreenViewTrait',
  ],

  requires: [
    'foam.apps.builder.administrator.AdminView',
    'foam.apps.builder.templates.AppView',
    'foam.apps.builder.templates.PanelView',
  ],

  properties: [
    'data',
    {
      type: 'ViewFactory',
      name: 'panel',
      defaultValue: 'foam.apps.builder.templates.PanelView',
    },
    {
      type: 'ViewFactory',
      name: 'app',
      defaultValue: {
        factory_: 'foam.apps.builder.templates.AppView',
        delegate: 'foam.apps.builder.administrator.AdminView',
      },
    },
  ],

  methods: [
    function init() {
      this.SUPER();

      this.Y.set('mdToolbar', null);
    }
  ],
});
