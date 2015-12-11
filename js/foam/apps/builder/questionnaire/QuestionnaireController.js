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

  extends: 'foam.apps.builder.AppController',

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
      name: 'data',
      help: 'The configuration for app parameters, question set, etc.',
      postSet: function(old,nu) {
        if ( old ) {
          old.getDataConfig().model$.removeListener(this.configChange);
        }
        if ( nu ) {
          nu.getDataConfig().model$.addListener(this.configChange);
          this.configChange(null, null, null, nu.getDataConfig().model);
        }
      }
    },
    {
      name: 'dao',
      help: 'The store of questionnaires filled in by users.',
    },
    {
      name: 'content',
      help: 'The current questionnaire being edited',
      view: 'foam.apps.builder.questionnaire.QuestionnaireDetailView',
      lazyFactory: function() {
        return this.data.getDataConfig().model.create({}, this.Y);
      }
    },
  ],

  methods: [
    function exportDAOs() {
      this.SUPER();
      this.dao = this.Y.submissionsDAO;
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
        var model = this.data.getDataConfig().model;
        model.instance_.prototype_ = null;
        this.content = model.create({}, this.Y);
        this.updateHTML();
      }
    },
  ],

  actions: [
    {
      name: 'save',
      ligature: 'done',
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
      ligature: 'refresh',
      //isAvailable: function() { return this.data.enableReloadBttn; },
      code: function() {
        this.content = this.data.getDataConfig().model.create({}, this.Y);
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
