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
  extends: 'foam.apps.builder.wizard.NewOrExistingWizard',

  requires: [
    'foam.apps.builder.wizard.NewDAOWizard',
    'foam.apps.builder.dao.DAOFactory',
  ],

  imports: [
    'daoConfigDAO as unfilteredExistingDAO',
  ],

  exports: [
    'selection'
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
      name: 'unfilteredExistingDAO',
      postSet: function(old, nu) {
        if ( this.data ) {
          this.filterExistingDAO();
        } else {
          this.data$.addListener(EventService.oneTime(this.filterExistingDAO));
        }
      }
    },
    {
      name: 'existingDAO',
      view: {
        factory_: 'foam.ui.md.DAOListView',
        rowView: 'foam.apps.builder.dao.DAOFactoryView',
      }
    }
  ],

  listeners: [
    {
      name: 'filterExistingDAO',
      code: function() {
        this.existingDAO = this.unfilteredExistingDAO;
//         .where(
//           EQ(this.DAOFactory.MODEL_TYPE, this.data.baseModelId)
//         );
      }
    },
  ],

  methods: [
    function onNext() {
      if ( this.selection && this.nextViewFactory === this.existingViewFactory ) {
        this.data.getDataConfig().dao = this.selection;
      }
      if ( this.nextViewFactory === this.newViewFactory ) {
        this.data.resetDAO();
      }
      this.SUPER();
    },
  ],

});
