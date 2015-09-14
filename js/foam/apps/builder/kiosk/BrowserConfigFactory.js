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
  package: 'foam.apps.builder.kiosk',
  name: 'BrowserConfigFactory',

  requires: [
    'foam.dao.EasyDAO',
    'foam.apps.builder.BrowserConfig',
    'foam.apps.builder.kiosk.AppConfig',
    'foam.apps.builder.kiosk.DesignerView',
    'foam.ui.md.UpdateDetailView',
  ],

  methods: [
    function factory(opt_X) {
      var X = opt_X || this.X;
      return this.BrowserConfig.create({
            title: 'Kiosk Apps',
            label: 'Kiosk App',
            model: this.AppConfig,
            dao: this.EasyDAO.create({
              model: this.AppConfig,
              name: 'KioskAppConfigs',
              daoType: this.IDBDAO,
              cache: true,
              seqNo: true,
              logging: true,
            }, X),
            detailView: {
              factory_: 'foam.ui.md.UpdateDetailView',
              liveEdit: true,
              minWidth: 600,
              preferredWidth: 10000,
            },
            innerDetailView: 'foam.apps.builder.kiosk.DesignerView',
      }, X);
    },
  ],
});
