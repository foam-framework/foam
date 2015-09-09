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
  package: 'foam.apps.builder.questionnaire',
  name: 'BrowserConfigFactory',

  requires: [
    'foam.apps.builder.wizard.WizardStackView',
    'foam.apps.builder.questionnaire.AppConfig as QuestionnaireAppConfig',
    'foam.apps.builder.questionnaire.DesignerView as QuestionnaireDesignerView',
    'foam.apps.builder.questionnaire.AppWizard',
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
        title: 'Questionnaire Apps',
        label: 'Questionnaire App',
        model: this.QuestionnaireAppConfig,
        dao:
        this.SeqNoDAO.create({ delegate:
          this.ContextualizingDAO.create({ delegate:
            this.IDBDAO.create({
              model: this.QuestionnaireAppConfig,
              name: 'QuestionnaireAppConfigs',
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
                factory_: 'foam.apps.builder.questionnaire.AppWizard',
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
        innerDetailView: { factory_: 'foam.apps.builder.AppConfigDetailView',
          innerView: 'foam.apps.builder.questionnaire.DesignerView'
        },
      }, X);
    },
  ],

});
