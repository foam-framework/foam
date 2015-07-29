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
  name: 'KioskExportManager',

  requires: [
    'XHR',
    'foam.dao.ChromeFile',
    'foam.dao.ChromeFileSystemDAO',
  ],

  properties: [
    {
      type: 'foam.apps.builder.KioskAppConfig',
      name: 'config',
      postSet: function(old, nu) {
        if ( old === nu || ( old && old.equals(nu) ) ) return;
        var self = this;
        self.onState('IDLE', function() {
          self.state = 'LOADING';
          self.aloadSources(function() {
            self.generateSources();
            self.state = 'IDLE';
          });
        });
      },
      required: true,
    },
    {
      model_: 'ArrayProperty',
      subType: 'foam.dao.ChromeFile',
      name: 'existingSources',
      factory: function() { return []; },
      transient: true,
    },
    {
      model_: 'ArrayProperty',
      subType: 'foam.dao.ChromeFile',
      name: 'generatedSources',
      factory: function() { return []; },
      transient: true,
    },
    {
      name: 'cachedSources',
      factory: function() { return {}; },
    },
    {
      model_: 'foam.core.types.StringEnumProperty',
      name: 'state',
      defaultValue: 'IDLE',
      choices: [
        ['IDLE', 'Idle'],
        ['LOADING', 'Loading'],
        ['EXPORTING', 'Exporting'],
      ],
      postSet: function(old, nu, prop) { console.log(this.name_, this.$UID, prop.name, old, nu); },
    },
  ],

  methods: [
    function aloadSources(ret) {
      var self = this;
      var n = self.config.EXISTING_SOURCES.length;
      var c = 0;
      var sources = new Array(n);
      self.config.EXISTING_SOURCES.forEach(function(path, i) {
        var file = self.getFile(path);
        if ( file ) {
          sources[i] = file;
          ++c;
        } else {
          self.XHR.create().asend(function(data, xhr, status) {
            ++c;
            if ( status ) {
              self.setFile(path, data);
              sources[i] = self.getFile(path);
            }
            if ( c === n ) {
              self.existingSources = sources;
              ret && ret(sources);
            }
          }, path);
        }
        if ( c === n ) {
          self.existingSources = sources;
          ret && ret(sources);
        }
      });
    },
    function generateSources() {
      var sources = [];

      var out = TemplateOutput.create(this.config);
      this.config.toManifest(out);
      this.setFile('manifest.json', out.toString());
      sources.push(this.getFile('manifest.json'));

      this.setFile('config.json',
                   JSONUtil.compact.where(NOT_TRANSIENT).stringify(this.config));
      sources.push(this.getFile('config.json'));

      this.generatedSources = sources;
    },
    function exportKiosk() {
      this.onState('IDLE', function() {
        this.state = 'EXPORTING';
        var n = this.existingSources.length + this.generatedSources.length;
        var c = 0;
        var sink = {
          put: function() {
            ++c;
            if ( c === n ) this.state = 'IDLE';
          }.bind(this),
          error: function() {
            this.state = 'IDLE';
          }.bind(this),
        };
        var dao = this.ChromeFileSystemDAO.create({}, this.Y);
        this.existingSources.forEach(function(file) {
          dao.put(file, sink);
        });
        this.generatedSources.forEach(function(file) {
          dao.put(file, sink);
        });
      }.bind(this));
    },
    function setFile(path, contents) {
      var file = this.ChromeFile.create({
        path: path,
        contents: contents
      });
      this.cachedSources[path] = file;
      return file;
    },
    function getFile(path) {
      return this.cachedSources[path];
    },
    function onState(state, f) {
      if ( this.state === state ) {
        f();
        return;
      }

      var listener = function() {
        if ( this.state === state ) {
          f();
          this.state$.removeListener(listener);
        }
      }.bind(this);
      this.state$.addListener(listener);
    },
  ],
});
