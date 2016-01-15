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
  name: 'SourceManager',

  models: [
    {
      name: 'File',
      properties: [
        { type: 'String', name: 'path' },
        { name: 'contents' },
      ],
    },
  ],

  properties: [
    {
      name: 'xhrManager',
      required: true,
      transient: true,
    },
    {
      type: 'Array',
      name: 'sources',
      transient: true,
    },
    {
      type: 'Function',
      name: 'agetFile',
      defaultValue: null,
    },
  ],

  methods: [
    function init() {
      this.SUPER();
      var fetch = amemo1(this.agetFile_.bind(this));
      this.agetFile = function(path) {
        return function(ret) { return fetch(ret, path); };
      }.bind(this);
    },
    function aloadSources(config, ret) {
      return apar.apply(
          null,
          config.EXISTING_SOURCES.map(this.agetFile))(function() {
            var existingSources = argsToArray(arguments);
            var generatedSources = this.generateSources(config);
            ret && ret.apply(
                this, existingSources.concat(generatedSources));
          }.bind(this));
    },
    function generateSources(config) {
      var sources = [];

      var out = TemplateOutput.create(this);
      config.toManifest(out);
      sources.push(this.createFile('manifest.json', out.toString()));

      var jsonConfig = ObjectToJSON.visit(config);
      sources.push(this.createFile(
          'config.json',
          JSONUtil.compact.where(NOT_TRANSIENT).stringify(jsonConfig)));

      return sources;
    },
    function agetFile_(ret, path) {
      this.xhrManager.asend(function(data, xhr, status) {
        if ( ! status ) ret && ret(data);
        ret && ret(this.createFile(path, data));
      }.bind(this), path);
    },
    function createFile(path, contents) {
      return this.File.create({
        path: path,
        contents: contents
      }, this.Y);
    },
  ],
});
