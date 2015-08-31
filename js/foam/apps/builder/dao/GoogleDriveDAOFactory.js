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

  extendsModel: 'foam.apps.builder.dao.DAOFactory',

  label: 'Cloud storage on Google Drive',

  requires: [
    'com.google.drive.FileDAO',
    'foam.dao.EasyDAO',
    'foam.oauth2.AutoOAuth2',
    'XHR'
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
      model_: 'FactoryProperty',
      hidden: true,
      name: 'factory', //TODO(jacksonic): Should be named .create, but can't until Model.create is moved
      defaultValue: function() {

        var authX = this.AutoOAuth2.create().Y;
        var agent = authX.lookup('foam.oauth2.EasyOAuth2').create({
          scopes: [
            'https://www.googleapis.com/auth/drive.appfolder'
          ],
          clientId: this.authClientId,
          clientSecret: this.authClientSecret
        });

        authX.registerModel(
          this.XHR.xbind({
            authAgent: agent
          })
        );

        return this.EasyDAO.create({
          model: this.X.lookup(this.modelType),
          name: this.name,
          daoType: this.FileDAO,
          cache: true,
          guid: true,
          logging: true
        }, authX);
      },
    }
  ],

});
