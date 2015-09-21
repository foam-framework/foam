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
    'foam.apps.builder.BrowserConfig',
    'foam.apps.builder.kiosk.AppConfig',
    'foam.apps.builder.kiosk.BasicInfoWizard',
    'foam.apps.builder.kiosk.DesignerView',
    'foam.apps.builder.wizard.WizardStackView',
    'foam.dao.EasyDAO',
    'foam.dao.IDBDAO',
    'foam.ui.md.UpdateDetailView',
  ],

  methods: [
    function factory(opt_X) {
      var X = opt_X || this.X;
      var WizardStackView = X.lookup('foam.apps.builder.wizard.WizardStackView') ||
          this.WizardStackView;
      var AppConfig = X.lookup('foam.apps.builder.kiosk.AppConfig') ||
          this.AppConfig;
      var EasyDAO = X.lookup('foam.dao.EasyDAO') || this.EasyDAO;
      var IDBDAO = X.lookup('foam.dao.IDBDAO') || this.IDBDAO;
      return this.BrowserConfig.create({
        title: 'Kiosk Apps',
        label: 'Kiosk Apps',
        model: AppConfig,
        dao: EasyDAO.create({
          model: AppConfig,
          name: 'KioskAppConfigs',
          daoType: IDBDAO,
          cache: true,
          seqNo: true,
          logging: true,
        }, X),
        createFunction: function() {
          var newObj = this.data.model.create({}, X);
          var view = WizardStackView.create({
            firstPage: {
              factory_: 'foam.apps.builder.kiosk.BasicInfoWizard',
              data: newObj,
            }}, X.sub({
              dao: this.data.dao,
            }));
          view.open();
        },
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
