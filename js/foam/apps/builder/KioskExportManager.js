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
      model_: 'FunctionProperty',
      name: 'agetFile',
      defaultValue: null
    },
  ],

  methods: [
    function init() {
      this.SUPER();
      var fetch = amemo1(this.agetFile_.bind(this));
      this.agetFile = function(path) {
        return function(ret) { return fetch(ret, path); };
      }.bind(this);
      if ( this.config ) this.aloadSources();
    },
    function aloadSources(ret) {
      var afuncs = this.config.EXISTING_SOURCES.map(this.agetFile);
      return apar.apply(null, afuncs)(function() {
        this.generateSources();
        ret && ret();
      }.bind(this));
    },
    function generateSources() {
      var sources = [];

      var out = TemplateOutput.create(this.config);
      this.config.toManifest(out);
      sources.push(this.createFile('manifest.json', out.toString()));

      sources.push(this.createFile(
          'config.json',
          JSONUtil.compact.where(NOT_TRANSIENT).stringify(this.config)));

      this.generatedSources = sources;
    },
    function agetFile_(ret, path) {
      this.XHR.create().asend(function(data, xhr, status) {
        if ( ! status ) ret && ret(data);
        ret && ret(this.createFile(path, data));
      }.bind(this), path);
    },
    function createFile(path, contents) {
      return this.ChromeFile.create({
        path: path,
        contents: contents
      });
    },
    function exportKiosk() {
      this.aloadSources(this.exportKiosk_.bind(this));
    },
    function exportKiosk_() {
      var dao = this.ChromeFileSystemDAO.create({}, this.Y);
      this.existingSources.forEach(function(file) {
        dao.put(file);
      });
      this.generatedSources.forEach(function(file) {
        dao.put(file);
      });
    },
  ],
});
