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
  name: 'EmbeddedDAOFactory',
  package: 'foam.apps.builder.dao',

  extendsModel: 'foam.apps.builder.dao.DAOFactory',

  label: 'Embedded storage that lives inside your app. Add data from an Admini App.',

  requires: [
    'foam.dao.SeqNoDAO',
    'foam.dao.EasyDAO',
  ],

  documentation: "Holds a serializable description of a DAO type.",

  properties: [
    {
      model_: 'FactoryProperty',
      hidden: true,
      name: 'factory',
      defaultValue: function(name, model, X) {
        // TODO: add MDAO support
        //return this.SeqNoDAO.create({ delegate: this.store_.dao });
        this.share_ = this.EasyDAO.create({
          model: model,
          name: name,
          daoType: this.IDBDAO,
          cache: true,
          seqNo: true,
          logging: true,
        });
        this.store_ = [].dao;

        this.syncShared();

        return this.store_;
      },
    },
    {
      name: 'requiresUserConfiguration',
      defaultValue: false,
      hidden: true,
    },
    {
      model_: 'ArrayProperty',
      name: 'store_',
      hidden: true,
    },
    {
      model_: 'foam.apps.builder.NoCloneProperty',
      name: 'share_',
      documentation: "An area to copy the data to so that multiple apps can share or edit the data at app design time.",
      transient: true,
      hidden: true,
      propertyToJSON: function() { return ''; },
    },
  ],

  methods: [
    function syncShared() {
      this.store_.dao;

      // Once: dump the contents of the share into the store, and vice-versa.
      this.store_.select(this.share_);
      this.share_.select(this.store_);

      // Continually: pass puts and removes through to the share as well
      this.store_.listen(this.share_);
    },
  ],
});