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
  package: 'foam.apps.builder.dao',
  name: 'DAOSummaryView',
  extendsModel: 'foam.apps.builder.SummaryView',

  requires: [
    'foam.apps.builder.dao.DAOFactoryView',
    'foam.apps.builder.wizard.ChangeDAOWizard',
  ],

  properties: [
    {
      name: 'extraClassName',
      defaultValue: 'dao-summary-view',
    },
    {
      name: 'wizardStartPageName',
      defaultValue: 'foam.apps.builder.wizard.ChangeDAOWizard',
    },
    {
      name: 'citationViewFactory',
      defaultValue: function() {
        return this.DAOFactoryView.create({ data: this.data.getDataConfig().dao });
      }
    },
    {
      model_: 'ViewFactoryProperty',
      name: 'icon',
      defaultValue: {
        factory_: 'foam.ui.Icon',
        ligature: 'storage',
        color: 'white',
        fontSize: '48',
        width: 48,
        height: 48,
      },
    },
  ],

  templates: [
    function CSS() {/*
      .md-summary-view.dao-summary-view {
        background: #D77;
      }
    */},
  ],

});

