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
  package: 'foam.apps.builder.wizard',
  name: 'NewOrExistingDAOWizard',
  extendsModel: 'foam.apps.builder.wizard.NewOrExistingWizard',

  requires: [
    'foam.apps.builder.wizard.NewDAOWizard',
  ],

  imports: [
    'daoConfigDAO as existingDAO',
  ],

  exports: [
    'selection$'
  ],

  properties: [
    {
      name: 'newViewFactory',
      label: 'Create a new Data Source',
      defaultValue: { factory_: 'foam.apps.builder.wizard.NewDAOWizard' },
    },
    {
      name: 'existingViewFactory',
      label: 'Use an existing Data Source',
      defaultValue: null,
    },
    {
      name: 'nextViewFactory',
      lazyFactory: function() { return this.newViewFactory; },
    },
    {
      name: 'selection',
    },
    {
      name: 'existingDAO',
      view: {
        factory_: 'foam.ui.md.DAOListView',
        rowView: 'foam.apps.builder.dao.DAOFactoryView',
      }
    }
  ],

  methods: [
    function onNext() {
      this.SUPER();
      if ( this.selection && this.nextViewFactory === this.exitinstViewFactory ) {
        this.data.dao = this.selection;
      }
    },
  ],

});
