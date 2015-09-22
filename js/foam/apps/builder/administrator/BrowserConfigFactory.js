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
  name: 'BrowserConfigFactory',

  requires: [
    'foam.apps.builder.wizard.WizardStackView',
    'foam.apps.builder.administrator.AppConfig as AdminAppConfig',
    'foam.apps.builder.administrator.DesignerView as AdminDesignerView',
    'foam.apps.builder.administrator.AppWizard',
    'foam.dao.ContextualizingDAO',
    'foam.dao.EasyDAO',
    'foam.dao.IDBDAO',
    'foam.dao.SeqNoDAO',
    'foam.apps.builder.BrowserConfig',
  ],


  methods: [
    function factory(opt_X) {
      var X = opt_X || this.X;
      return this.BrowserConfig.create({
        title: 'Admin Apps',
        label: 'Admin Apps',
        model: this.AdminAppConfig,
        dao:
        this.SeqNoDAO.create({ delegate:
          this.ContextualizingDAO.create({ delegate:
            this.IDBDAO.create({
              model: this.AdminAppConfig,
              name: 'AdminAppConfigs',
              useSimpleSerialization: false,
            })
          })
        }),
        createFunction: function() {
          /* 'this' is the browser view, this.data is the BrowserConfig */
          var X = this.X;
          var newObj = this.data.model.create();
          var view = X.lookup('foam.apps.builder.wizard.WizardStackView').create({
              firstPage: {
                factory_: 'foam.apps.builder.administrator.AppWizard',
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
          preferredWidth: 10000
        },
        innerDetailView: { factory_: 'foam.apps.builder.AppConfigActionsView',
          delegate: 'foam.apps.builder.administrator.DesignerView'
        },
      }, X);
    },
  ],

});
