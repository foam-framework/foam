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
    'foam.apps.builder.Upload',
    'foam.dao.EasyDAO',
    'foam.metrics.Error',
    'foam.metrics.Event',
  ],
  imports: [
    'identityManager',
    'metricsDAO',
    'sourceManager',
    'xhrManager',
  ],

  constants: {
    UPLOAD_TO_CWS: function(id) {
      return 'https://www.googleapis.com/upload/chromewebstore/v1.1/items' +
          (id ? '/' + id : '');
    },
    PUBLISH_TO_CWS: function(id) {
      return 'https://www.googleapis.com/chromewebstore/v1.1/items/' +
          id + '/publish';
    },
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
    {
      model_: 'foam.core.types.DAOProperty',
      name: 'uploadCache',
      lazyFactory: function() {
        return this.EasyDAO.create({
          name: 'uploadCache',
          model: this.Upload,
          daoType: 'IDB',
          cache: true,
          logging: true,
        }, this.Y);
      },
    },
  ],

  methods: [
    function exportApp(data) {
      this.exportApp_(this.completeUpload.bind(this));
    },
    function exportApp_(ret) {
      aseq(
          this.sourceManager.aloadSources.bind(this.sourceManager, this.data.config),
          this.packageManager.prepareSources.bind(this.packageManager),
          apar(
              this.identityManager.withOAuth.bind(this.identityManager),
              this.prepareUpload.bind(this)),
          this.sendUpload.bind(this),
          this.finalizeUpload.bind(this))(ret);
    },
    function publishApp(data) {
      aseq(
          apar(
              this.identityManager.withOAuth.bind(this.identityManager),
              aseq(
                  this.getUploadHash.bind(this),
                  aif(this.needsUpload.bind(this),
                      this.exportApp_.bind(this),
                      aconstant(data.config)))),
          this.sendPublish.bind(this))
      (this.completePublish.bind(this));
    },
    function getUploadHash(ret) {
      this.uploadCache.find(this.data.config.chromeId, {
        put: function(obj) { ret(obj); },
        error: function() { ret() },
      });
    },
    function needsUpload(hash) {
      return ( ! hash ) || this.data.config.hashCode() !== hash.objectHashCode;
    },
    function sendPublish(ret, oauth, config) {
      if ( ! ( oauth && config ) ) {
        this.data.message = 'Oops! Looks like something went wrong.';
        this.data.details =
            'Did you grant the application the permission it needs to publish your app?';
        this.data.state = 'FAILED';
        this.metricsDAO.put(this.Error.create({
          name: 'Action:publish:fail - ' +
              (config.model_.id || config.name_) +
              ' - Access denied',
        }));
        return;
      }

      this.data.state = 'PUBLISHING';

      this.xhrManager.asend(
          ret,
          this.PUBLISH_TO_CWS(config.chromeId),
          JSON.stringify({
            // TODO(markdittmer): Change this parameter to "default" when/if we want
            // one-click-publish-to-the-world.
            target: 'trustedTesters',
          }),
          'POST');
    },
    function completePublish(data, xhr, status) {
      if ( ( ! status ) || data.error ) {
        var errors = (data.error && data.error.errors) || [];
        this.data.message = 'Oops! Something went wrong during your publish request.';
        this.data.details =
            // TODO(markdittmer): These may not be internationalized.
            errors.map(function(err) { return err.message; }).join(' ');
        this.data.state = 'FAILED';
        this.metricsDAO.put(this.Error.create({
          name: 'Action:publish:fail - ' +
              (this.data.config.model_.id || this.data.config.name_) +
              ' - Errors ' + errors.join(' '),
        }));
        return;
      }

      this.metricsDAO.put(this.Event.create({
        name: 'Action:publish:finish',
        label: this.data.config.model_.id || this.data.config.name_,
      }));

      this.data.state = 'COMPLETED';
      this.data.details = 'App published to the Chrome Web Store.';

      ret && ret(this.data.config);
    },
    function prepareUpload(ret, archive) {
      var indicators = argsToArray(arguments).slice(2);

      if ( ! archive ) {
        this.data.message = 'Oops! Looks like something went wrong packaging your app.';
        this.data.details = 'Make sure all required fields are filled out.';
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
        this.data.message = 'Oops! Looks like something went wrong.';
        this.data.details =
            'Did you grant the application the permission it needs to upload your app?';
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
          this.UPLOAD_TO_CWS(id),
          data,
          id ? 'PUT' : 'POST');
    },
    function finalizeUpload(ret, data, xhr, status) {
      if ( ( ! status ) || data.uploadState !== 'SUCCESS' ) {
        this.data.message = 'Oops! Something went wrong during the file upload.';
        this.data.details =
            // TODO(markdittmer): These may not be internationalized.
            data.itemError.map(function(err) { return err.itemError; }).join(' ');
        this.data.state = 'FAILED';
        this.metricsDAO.put(this.Error.create({
          name: 'Action:upload:fail - ' +
              (this.data.config.model_.id || this.data.config.name_) +
              ' - Status ' + (status ? data.uploadState : xhr.status),
        }));
        return;
      }

      this.data.config.chromeId = data.id;
      this.uploadCache.put(this.Upload.create({
        id: data.id,
        objectHashCode: this.data.config.hashCode(),
      }, this.Y));

      ret && ret(this.data.config);
    },
    function completeUpload(config) {
      this.metricsDAO.put(this.Event.create({
        name: 'Action:upload:finish',
        label: this.data.config.model_.id || this.data.config.name_,
      }));

      // TODO(markdittmer): This is currently not going through. Perhaps we
      // need to wait for the updateDetailView to receive an event/update?
      this.data.updateView && this.data.updateView.save && this.data.updateView.save();
      this.data.state = 'COMPLETED';
      this.data.details = 'App uploaded to your Chrome Web Store dashboard.';
    },
  ],
});
