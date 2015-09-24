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
  package: 'foam.apps.builder',
  name: 'ImportManager',
  extendsModel: '',

  requires: [
    'foam.dao.ChromeFileSystemDAO',
  ],
  imports: [
    'metricsDAO',
    'sourceManager',
  ],

  properties: [
    {
      type: 'foam.apps.builder.ImportExportFlow',
      name: 'data',
    },
  ],

  methods: [
    function importApp(data) {
      this.data = data;
      data.state = 'IMPORTING';
      var dao = this.ChromeFileSystemDAO.create({}, this.Y);
      dao.find({ path: 'config.js' }, {
        put: function(file) {
          aeval('(function() { var window = {};' +
              file.contents + 'return window.config; })()')
          (function(config) {
            if ( ( ! config ) || config.model_ !== 'AppConfig' ) {
              this.failBadConfig();
              return;
            }

            delete config.model_;
            delete config.id;
            config.rotation = parseInt(config.rotation);
            config.rotation = isNaN(config.rotation) ? 0 : config.rotation;
            this.data.config.copyFrom(config);
            this.data.dao.put(this.data.config, {
              put: function() {
                this.succeed();
              }.bind(this),
              error: function() {
                this.failBadConfig();
              }.bind(this),
            });
          }.bind(this));
        }.bind(this),
        error: function(err) {
          this.data.message = 'Oop! Looks like something went wrong.',
          this.data.state = 'FAILED';
          if ( dao.isFileError(err) ) this.failBadConfig();
          else                        this.failUserAbort();
        }.bind(this),
      });
    },
    function succeed() {
      this.data.state = 'COMPLETED';
      this.data.details =
          'Your app was successfully imported to App Builder.';
    },
    function failBadConfig() {
      this.data.message = 'Oop! Looks like something went wrong.',
      this.data.details =
          "We couldn't find a valid kiosk app configuration in the " +
          'directory you chose.';
      this.data.state = 'FAILED';
    },
    function failUserAbort() {
      this.data.message = 'Oop! Looks like something went wrong.',
      this.data.details =
          'Did you select a folder for the application to import from?';
      this.data.state = 'FAILED';
    },
  ],
});
