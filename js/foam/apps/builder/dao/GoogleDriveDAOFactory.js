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
  name: 'GoogleDriveDAOFactory',
  package: 'foam.apps.builder.dao',

  extends: 'foam.apps.builder.dao.DAOFactory',

  label: 'Cloud storage on Google Drive',

  requires: [
    'XHR',
    'com.google.drive.FileDAO',
    'foam.dao.EasyDAO',
    'foam.dao.FutureDAO',
    'foam.oauth2.AutoOAuth2'
  ],

  properties: [
    {
      name: 'name',
    },
    {
      name: 'label',
    },
    {
      name: 'authClientId'
    },
    {
      name: 'authClientSecret'
    },
    {
      name: 'requiresUserConfiguration',
      defaultValue: true,
      hidden: true,
    },
    {
      type: 'Factory',
      hidden: true,
      name: 'factory', //TODO(jacksonic): Should be named .create, but can't until Model.create is moved
      defaultValue: function(name, model, X) {
        var identityManager = X.importExportManager$.get().identityManager;
        var future = afuture();

        identityManager.withOAuth(function(oauthStatus, authAgent) {
          var authX = this.Y.sub();
          authX.registerModel(this.XHR.xbind({ authAgent: authAgent }));
          future.set(this.EasyDAO.create({
            model: model,
            name: name,
            daoType: this.FileDAO,
            cache: true,
            guid: true,
            logging: true
          }, authX));
        }.bind(this));

        return this.FutureDAO.create({ future: future.get }, this.Y);
      },
    }
  ],

});
