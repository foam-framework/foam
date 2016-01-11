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
  extends: '',

  requires: [
    'foam.apps.builder.ConfigParser',
    'foam.apps.builder.ImportExportFlow',
    'foam.dao.ChromeFileSystemDAO',
  ],

  properties: [
    {
      name: 'data',
    },
    {
      name: 'configParser',
      lazyFactory: function() {
        return this.ConfigParser.create({}, this.Y).parser;
      },
    },
  ],

  methods: [
    function importV1App(data) {
      this.data = data;
      data.state = 'IMPORTING';
      var dao = this.ChromeFileSystemDAO.create({}, this.Y);
      dao.find({ path: 'config.js' }, {
        put: function(file) {
          var match = (new RegExp('^window.config = ({[\\s\\S]*});\\n$'))
              .exec(file.contents);
          if ( ( ! match ) || ( ! match[1] ) ) {
            this.failBadConfig();
            return;
          }
          var objLiteralStr = match[1];
          var config = this.configParser.parseString(objLiteralStr,
                                                    this.configParser.obj);
          if ( ! config ) {
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
        }.bind(this),
        error: function(err) {
          if ( dao.isFileError(err) ) this.failBadConfig();
          else                        this.failUserAbort();
        }.bind(this),
      });
    },
    function importV2App(data) {
      this.data = data;
      data.state = 'IMPORTING';
      var dao = this.ChromeFileSystemDAO.create({}, this.Y);
      dao.find({ path: 'config.json' }, {
        put: function(file) {
          var objLiteralStr = file.contents;
          var config = this.configParser.parseString(objLiteralStr,
                                                    this.configParser.obj);
          if ( ! config ) {
            this.failBadConfig();
            return;
          }

          delete config.model_;
          this.data.config.copyFrom(config);
          this.data.dao.put(this.data.config, {
            put: function() {
              this.succeed();
            }.bind(this),
            error: function() {
              this.failBadConfig();
            }.bind(this),
          });
        }.bind(this),
        error: function(err) {
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
