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
  package: 'foam.apps.builder.questionnaire',
  name: 'QuestionnaireController',

  extendsModel: 'foam.ui.md.DetailView',

  requires: [
    'foam.ui.md.DetailView',
    'foam.apps.builder.questionnaire.Questionnaire',
    'foam.apps.builder.questionnaire.QuestionnaireDetailView',
    'foam.dao.EasyDAO',
    'foam.dao.IDBDAO',
  ],

  exports: [
    'dao'
  ],

  properties: [
    {
      name: 'appConfig',
      help: 'The configuration for app parameters, question set, etc.',
      postSet: function(old,nu) {
        if ( old ) {
          old.model$.removeListener(this.configChange);
        }
        if ( nu ) {
          nu.model$.addListener(this.configChange);
          this.configChange(null, null, null, nu.model);
        }
      }
    },
    {
      name: 'dao',
      help: 'The store of questionnaires filled in by users.',
      lazyFactory: function() {
        return this.appConfig.createDAO();
      }
    },
    {
      name: 'content',
      help: 'The current questionnaire being edited',
      view: 'foam.apps.builder.questionnaire.QuestionnaireDetailView',
      lazyFactory: function() {
        return this.appConfig.getDataConfig().model.create({}, this.Y);
      }
    },
  ],

  listeners: [
    {
      name: 'configChange',
      code: function(obj, topic, old, nu) {
        if ( old ) old.removeListener(this.modelChange);
        if ( nu ) nu.addListener(this.modelChange);
        this.modelChange();
      }
    },
    {
      name: 'modelChange',
      code: function(obj, topic, old, nu) {
        this.appConfig.dataConfigs[0].model.instance_.prototype_ = null;
        this.content = this.appConfig.getDataConfig().model.create({}, this.Y);
        this.updateHTML();
      }
    },
  ],

  actions: [
    {
      name: 'save',
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAASUlEQVR4AWPADUaBFmnKQxh+MzSQpvw/Q8PwU87KsIohkBTTI4CSvxiCSHAMUPI/UFEQunLCWoLRlBPWglBOpBaYcqK1YCgfBQDw0y1mS9NLDAAAAABJRU5ErkJggg==',
      //isAvailable: function() { return this.data.enableHomeBttn; },
      code: function() {
        this.dao.put(this.content, {
            put: function() {
              this.reload();
              //TODO: save ok notification
            }.bind(this),
            error: function() {
              //TODO: error notification
            }.bind(this),
        });
      }
    },
    {
      name: 'reload',
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAwElEQVR4Ad3SP04CURDA4a8RlpNYEP5zQbBGIYT4Ck5iZbwEcStj9AQW7JrI2LLxuYmx45tuMr9uXKSJpFT7VErGgIWsnr1ozElSWIr8+ZNwtDLV1TGzUQsvIh/shVd958Y+RD6YCEd9TTciH5CElaal+D0ohalzC9EW1EJXi38Hz8LMH9wLd3K2wq0fRk4qg8y+9uVaRhLeDJ0behfWsgqPQmVtrqcwt1EJD64gnyQnzefb6mg1snNQqR3sDFygb3rVYPgYJpUVAAAAAElFTkSuQmCC',
      //isAvailable: function() { return this.data.enableReloadBttn; },
      code: function() {
        this.content = this.appConfig.getDataConfig().model.create({}, this.Y);
      }
    },
  ],

  templates: [
    function toHTML() {/*
      <app-body id="%%id" <%= this.cssClassAttr() %>>
        $$content
      </app-body>
    */},
    function CSS() {/*
      app-body {
        overflow-y: auto;
      }
    */},
  ]
});
