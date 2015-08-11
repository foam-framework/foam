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
  name: 'UploadManager',

  requires: [
    'foam.apps.builder.PackageManager',
  ],
  imports: [
    'identityManager',
    'metricsDAO',
    'sourceManager',
    'xhrManager',
  ],

  constants: {
    UPLOAD_TO_CWS: 'https://www.googleapis.com/upload/chromewebstore/v1.1/items',
    HEADERS: [
      [
        /https?:[/][/]www.googleapis.com[/][^?#]*chromewebstore/,
        { 'x-goog-api-version': '2' },
      ],
    ],
  },

  properties: [
    {
      type: 'foam.apps.builder.ExportFlow',
      name: 'data',
    },
    {
      type: 'foam.apps.builder.PackageManager',
      name: 'packageManager',
      lazyFactory: function() {
        return this.PackageManager.create({}, this.Y);
      },
    },
  ],

  methods: [
    function exportApp(data) {
      this.data = data;
      aseq(
          this.sourceManager.aloadSources.bind(this.sourceManager, data.config),
          this.packageManager.prepareSources.bind(this.packageManager),
          apar(
              this.identityManager.withOAuth.bind(this.identityManager),
              this.prepareUpload.bind(this)),
          this.sendUpload.bind(this))
      (this.finalizeUpload.bind(this));
    },
    function prepareUpload(ret, archive) {
      var indicators = argsToArray(arguments).slice(2);

      if ( ! archive ) {
        this.data.message = 'Oop! Looks like something went wrong packaging your app. Make sure all required fields are filled out.';
        this.data.state = 'FAILED';
        this.metricsDAO.put(this.Error.create({
          name: 'Action:upload:fail - ' +
              (this.data.config.model_.id || this.data.config.name_) +
              ' - Packaging error',
        }));
        return;
      }

      var data = new FormData();
      data.append('uploadType', 'media');

      data.append('fileupload', archive.toBlob());

      ret(data);
    },
    function sendUpload(ret, oauth, data) {
      var config = this.data.config;

      if ( ! oauth ) {
        this.data.message = 'Oop! Looks like something went wrong. Did you grant the application the permission it needs to upload your app?';
        this.data.state = 'FAILED';
        this.metricsDAO.put(this.Error.create({
          name: 'Action:upload:fail - ' +
              (config.model_.id || config.name_) +
              ' - Access denied',
        }));
        return;
      }

      this.data.state = 'UPLOADING';
      var id = config.chromeId;
      this.xhrManager.asend(
          ret,
          this.UPLOAD_TO_CWS + (id ? '/' + id : ''),
          data,
          id ? 'PUT' : 'POST');
    },
    function finalizeUpload(data, xhr, status) {
      if ( ( ! status ) || data.uploadState !== 'SUCCESS' ) {
        this.data.message = 'Oop! Something went wrong during the file upload. Please try again later.';
        this.data.state = 'FAILED';
        this.metricsDAO.put(this.Error.create({
          name: 'Action:upload:fail - ' +
              (this.data.config.model_.id || this.data.config.name_) +
              ' - Status ' + (status ? data.uploadState : xhr.status),
        }));
        return;
      }

      this.data.config.chromeId = data.id;
      // TODO(markdittmer): This is currently not going through. Perhaps we
      // need to wait for the updateDetailView to receive an event/update?
      this.data.updateView && this.data.updateView.save && this.data.updateView.save();
      this.data.state = 'COMPLETED';
    },
  ],
});
